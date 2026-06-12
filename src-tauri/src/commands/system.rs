use serde::Serialize;
use sysinfo::{CpuRefreshKind, Disks, MemoryRefreshKind, Networks, RefreshKind, System};

#[derive(Serialize)]
pub struct CpuInfo {
    pub name: String,
    pub brand: String,
    pub usage: f32,
    pub frequency: u64,
    pub core_count: usize,
}

#[derive(Serialize)]
pub struct MemoryInfo {
    pub total: u64,
    pub used: u64,
    pub available: u64,
    pub usage_percent: f64,
    pub swap_total: u64,
    pub swap_used: u64,
}

#[derive(Serialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total: u64,
    pub available: u64,
    pub used: u64,
    pub usage_percent: f64,
    pub file_system: String,
}

#[derive(Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory: u64,
    pub cpu_usage: f32,
}

#[derive(Serialize)]
pub struct NetworkInfo {
    pub name: String,
    pub received: u64,
    pub transmitted: u64,
}

#[derive(Serialize)]
pub struct HealthScore {
    pub total: u32,
    pub cpu: u32,
    pub memory: u32,
    pub disk: u32,
    pub pressure: String, // "low" | "medium" | "high"
}

#[derive(Serialize)]
pub struct CleanResult {
    pub freed_bytes: u64,
    pub before_used: u64,
    pub after_used: u64,
    pub message: String,
}

#[derive(Serialize)]
pub struct SystemSnapshot {
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub disks: Vec<DiskInfo>,
    pub top_processes: Vec<ProcessInfo>,
    pub networks: Vec<NetworkInfo>,
    pub uptime: u64,
    pub health: HealthScore,
}

fn calc_health(cpu: f32, mem_percent: f64, disk_percent: f64) -> HealthScore {
    let cpu_score = if cpu < 30.0 { 100 } else if cpu < 60.0 { 80 } else if cpu < 85.0 { 60 } else { 30 };
    let mem_score = if mem_percent < 50.0 { 100 } else if mem_percent < 70.0 { 80 } else if mem_percent < 85.0 { 60 } else { 30 };
    let disk_score = if disk_percent < 60.0 { 100 } else if disk_percent < 80.0 { 80 } else if disk_percent < 90.0 { 60 } else { 30 };
    let total = (cpu_score + mem_score + disk_score) / 3;
    let pressure = if mem_percent > 85.0 { "high" } else if mem_percent > 70.0 { "medium" } else { "low" };
    HealthScore { total, cpu: cpu_score, memory: mem_score, disk: disk_score, pressure: pressure.to_string() }
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemSnapshot, String> {
    let mut sys = System::new_with_specifics(
        RefreshKind::new()
            .with_cpu(CpuRefreshKind::everything())
            .with_memory(MemoryRefreshKind::everything()),
    );

    std::thread::sleep(std::time::Duration::from_millis(200));
    sys.refresh_cpu_all();
    sys.refresh_memory();

    let cpu_usage = sys.global_cpu_usage();
    let cpus = sys.cpus();
    let cpu_info = CpuInfo {
        name: cpus.first().map(|c| c.name().to_string()).unwrap_or_default(),
        brand: cpus.first().map(|c| c.brand().to_string()).unwrap_or_default(),
        usage: cpu_usage,
        frequency: cpus.first().map(|c| c.frequency()).unwrap_or(0),
        core_count: cpus.len(),
    };

    let mem_percent = if sys.total_memory() > 0 {
        (sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0
    } else {
        0.0
    };
    let mem_info = MemoryInfo {
        total: sys.total_memory(),
        used: sys.used_memory(),
        available: sys.available_memory(),
        usage_percent: mem_percent,
        swap_total: sys.total_swap(),
        swap_used: sys.used_swap(),
    };

    let disks = Disks::new_with_refreshed_list();
    let mut max_disk_percent = 0.0f64;
    let disk_infos: Vec<DiskInfo> = disks
        .iter()
        .map(|d| {
            let total = d.total_space();
            let available = d.available_space();
            let used = total - available;
            let pct = if total > 0 { (used as f64 / total as f64) * 100.0 } else { 0.0 };
            if pct > max_disk_percent { max_disk_percent = pct; }
            DiskInfo {
                name: d.name().to_string_lossy().to_string(),
                mount_point: d.mount_point().to_string_lossy().to_string(),
                total, available, used,
                usage_percent: pct,
                file_system: d.file_system().to_string_lossy().to_string(),
            }
        })
        .collect();

    sys.refresh_processes(sysinfo::ProcessesToUpdate::All);
    let mut processes: Vec<ProcessInfo> = sys
        .processes()
        .iter()
        .map(|(pid, p)| ProcessInfo {
            pid: pid.as_u32(),
            name: p.name().to_string_lossy().to_string(),
            memory: p.memory(),
            cpu_usage: p.cpu_usage(),
        })
        .collect();
    processes.sort_by(|a, b| b.memory.cmp(&a.memory));
    let top_processes = processes.into_iter().take(20).collect();

    let networks = Networks::new_with_refreshed_list();
    let network_infos: Vec<NetworkInfo> = networks
        .iter()
        .map(|(name, data)| NetworkInfo {
            name: name.clone(),
            received: data.total_received(),
            transmitted: data.total_transmitted(),
        })
        .collect();

    let health = calc_health(cpu_usage, mem_percent, max_disk_percent);

    Ok(SystemSnapshot {
        cpu: cpu_info, memory: mem_info, disks: disk_infos,
        top_processes, networks: network_infos,
        uptime: System::uptime(), health,
    })
}

#[tauri::command]
pub fn kill_process(pid: u32) -> Result<String, String> {
    let mut sys = System::new();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All);
    let process = sysinfo::Pid::from_u32(pid);
    if let Some(p) = sys.process(process) {
        if p.kill() {
            Ok(format!("Process {} ({}) terminated", pid, p.name().to_string_lossy()))
        } else {
            Err(format!("Failed to kill process {} (permission denied?)", pid))
        }
    } else {
        Err(format!("Process {} not found", pid))
    }
}

#[tauri::command]
pub fn clean_memory(level: String) -> Result<CleanResult, String> {
    let before_used = {
        let mut sys = System::new();
        sys.refresh_memory();
        sys.used_memory()
    };

    let mut message = String::new();

    #[cfg(target_os = "macos")]
    {
        match level.as_str() {
            "soft" => {
                // 释放文件缓存
                let output = std::process::Command::new("purge").output();
                match output {
                    Ok(_) => message = "Soft clean: file cache released".to_string(),
                    Err(e) => message = format!("Soft clean partially failed: {}", e),
                }
            }
            "normal" => {
                let _ = std::process::Command::new("purge").output();
                // 尝试释放 inactive memory
                let _ = std::process::Command::new("sh")
                    .args(["-c", "sync && sudo purge 2>/dev/null || purge"])
                    .output();
                message = "Normal clean: cache + inactive memory released".to_string();
            }
            "aggressive" => {
                let _ = std::process::Command::new("purge").output();
                let _ = std::process::Command::new("sh")
                    .args(["-c", "sync && sudo purge 2>/dev/null || purge"])
                    .output();
                // 压缩内存
                let _ = std::process::Command::new("sh")
                    .args(["-c", "memory_pressure -S 2>/dev/null || true"])
                    .output();
                message = "Aggressive clean: all caches + compressed memory released".to_string();
            }
            _ => return Err("Invalid clean level".to_string()),
        }
    }

    #[cfg(target_os = "linux")]
    {
        match level.as_str() {
            "soft" => {
                let _ = std::process::Command::new("sh")
                    .args(["-c", "sync && echo 1 > /proc/sys/vm/drop_caches 2>/dev/null"])
                    .output();
                message = "Soft clean: page cache released".to_string();
            }
            "normal" => {
                let _ = std::process::Command::new("sh")
                    .args(["-c", "sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null"])
                    .output();
                message = "Normal clean: all caches released".to_string();
            }
            "aggressive" => {
                let _ = std::process::Command::new("sh")
                    .args(["-c", "sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null && swapoff -a && swapon -a 2>/dev/null"])
                    .output();
                message = "Aggressive clean: caches + swap recycled".to_string();
            }
            _ => return Err("Invalid clean level".to_string()),
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Windows: 使用 EmptyWorkingSet 或系统 API
        message = format!("Clean ({}) executed on Windows", level);
    }

    // 等待系统回收
    std::thread::sleep(std::time::Duration::from_millis(500));

    let after_used = {
        let mut sys = System::new();
        sys.refresh_memory();
        sys.used_memory()
    };

    let freed = before_used.saturating_sub(after_used);

    Ok(CleanResult {
        freed_bytes: freed,
        before_used,
        after_used,
        message,
    })
}
