use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MavenModule {
    pub name: String,
    pub path: String,
    pub is_aggregator: bool,
    pub children: Vec<MavenModule>,
}

#[derive(Debug, Serialize, Clone)]
pub struct BuildLogEvent {
    /// 当前模块索引 (1-based)
    pub index: usize,
    /// 总模块数
    pub total: usize,
    /// 当前模块名
    pub module_name: String,
    /// 日志行内容
    pub line: String,
    /// 日志类型: "stdout" | "stderr" | "info" | "error" | "success"
    pub kind: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct BuildDoneEvent {
    pub success: bool,
    pub duration_ms: u128,
    pub message: String,
    /// 复制 JAR 的结果
    pub copy_result: Option<String>,
}

/// 解析 pom.xml 中的 <modules> 列表
fn parse_modules_from_pom(pom_path: &PathBuf) -> Vec<String> {
    let content = match fs::read_to_string(pom_path) {
        Ok(c) => c,
        Err(_) => return vec![],
    };

    let mut modules = Vec::new();
    let mut in_modules = false;
    let mut current_module = String::new();

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed == "<modules>" {
            in_modules = true;
            continue;
        }
        if trimmed == "</modules>" {
            in_modules = false;
            continue;
        }
        if in_modules {
            if trimmed.starts_with("<module>") && trimmed.ends_with("</module>") {
                let name = trimmed
                    .replace("<module>", "")
                    .replace("</module>", "")
                    .trim()
                    .to_string();
                if !name.is_empty() {
                    modules.push(name);
                }
            } else if trimmed.starts_with("<module>") {
                current_module = trimmed.replace("<module>", "").trim().to_string();
            } else if trimmed.ends_with("</module>") && !current_module.is_empty() {
                current_module.push_str(trimmed.replace("</module>", "").trim());
                modules.push(current_module.trim().to_string());
                current_module = String::new();
            } else if !current_module.is_empty() {
                current_module.push_str(trimmed);
            }
        }
    }

    modules
}

fn is_aggregator_pom(pom_path: &PathBuf) -> bool {
    let content = match fs::read_to_string(pom_path) {
        Ok(c) => c,
        Err(_) => return false,
    };
    content.contains("<packaging>pom</packaging>")
}

fn scan_modules(project_path: &PathBuf, relative_path: &str) -> Vec<MavenModule> {
    let pom_path = project_path.join(relative_path).join("pom.xml");
    let module_names = parse_modules_from_pom(&pom_path);

    if module_names.is_empty() {
        return vec![];
    }

    let mut result = Vec::new();

    for name in &module_names {
        let child_relative = if relative_path.is_empty() {
            name.clone()
        } else {
            format!("{}/{}", relative_path, name)
        };

        let child_pom = project_path.join(&child_relative).join("pom.xml");
        let is_agg = is_aggregator_pom(&child_pom);

        let children = if is_agg {
            scan_modules(project_path, &child_relative)
        } else {
            vec![]
        };

        result.push(MavenModule {
            name: name.clone(),
            path: child_relative,
            is_aggregator: is_agg,
            children,
        });
    }

    result
}

fn flatten_leaf_modules(modules: &[MavenModule]) -> Vec<MavenModule> {
    let mut result = Vec::new();
    for m in modules {
        if m.children.is_empty() {
            result.push(m.clone());
        } else {
            result.extend(flatten_leaf_modules(&m.children));
        }
    }
    result
}

#[tauri::command]
pub fn list_maven_modules(project_path: String) -> Result<Vec<MavenModule>, String> {
    let path = PathBuf::from(&project_path);
    if !path.exists() {
        return Err(format!("项目路径不存在: {}", project_path));
    }
    let pom_path = path.join("pom.xml");
    if !pom_path.exists() {
        return Err(format!("未找到 pom.xml: {}", pom_path.display()));
    }

    let modules = scan_modules(&path, "");
    Ok(modules)
}

#[tauri::command]
pub fn list_maven_leaf_modules(project_path: String) -> Result<Vec<MavenModule>, String> {
    let tree = list_maven_modules(project_path)?;
    Ok(flatten_leaf_modules(&tree))
}

/// 在模块的 target 目录中查找构建好的 JAR 文件
fn find_built_jar(module_abs_path: &PathBuf) -> Option<PathBuf> {
    let target_dir = module_abs_path.join("target");
    if !target_dir.exists() {
        return None;
    }

    let entries = fs::read_dir(&target_dir).ok()?;
    let mut jars: Vec<_> = entries
        .filter_map(|e| e.ok())
        .filter(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            name.ends_with(".jar") && !name.contains("sources") && !name.contains("javadoc")
        })
        .collect();

    // 按修改时间排序，取最新的
    jars.sort_by(|a, b| {
        b.metadata()
            .and_then(|m| m.modified())
            .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
            .cmp(
                &a.metadata()
                    .and_then(|m| m.modified())
                    .unwrap_or(std::time::SystemTime::UNIX_EPOCH),
            )
    });

    jars.first().map(|e| e.path())
}

/// 复制 JAR 到指定目录
fn copy_jar_to_output(jar_path: &PathBuf, output_dir: &str) -> Result<String, String> {
    let dest_dir = PathBuf::from(output_dir);
    if !dest_dir.exists() {
        fs::create_dir_all(&dest_dir)
            .map_err(|e| format!("创建输出目录失败: {}", e))?;
    }

    let file_name = jar_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "app.jar".to_string());

    let dest_path = dest_dir.join(&file_name);
    fs::copy(jar_path, &dest_path)
        .map_err(|e| format!("复制 JAR 失败: {}", e))?;

    Ok(format!("已复制到: {}", dest_path.display()))
}

/// 后台构建多个模块（非阻塞，通过事件推送日志）
/// build_scope: "module" = 仅当前模块, "with-deps" = 含依赖模块(-am), "project" = 整个项目
#[tauri::command]
pub fn start_build(
    app: AppHandle,
    project_path: String,
    module_paths: Vec<String>,
    module_names: Vec<String>,
    profile: String,
    extra_args: Option<String>,
    skip_tests: bool,
    output_dir: Option<String>,
    build_scope: Option<String>,
) -> Result<(), String> {
    let path = PathBuf::from(&project_path);
    if !path.exists() {
        return Err(format!("项目路径不存在: {}", project_path));
    }

    let scope = build_scope.unwrap_or_else(|| "with-deps".to_string());

    // 在后台线程执行构建
    std::thread::spawn(move || {
        let start_all = std::time::Instant::now();
        let mut all_success = true;
        let mut last_copy_result: Option<String> = None;

        // "project" 模式：整项目构建一次，再复制选中模块的 JAR
        if scope == "project" {
            let _ = app.emit("build-log", BuildLogEvent {
                index: 1,
                total: 1,
                module_name: "整项目".to_string(),
                line: "═ 开始整项目构建 (mvn clean package)".to_string(),
                kind: "info".to_string(),
            });

            let mut args = vec!["clean".to_string(), "package".to_string()];
            if !profile.is_empty() {
                args.push("-P".to_string());
                args.push(profile.clone());
            }
            if skip_tests {
                args.push("-DskipTests".to_string());
            }
            if let Some(ref extra) = extra_args {
                for arg in extra.split_whitespace() {
                    args.push(arg.to_string());
                }
            }

            let child = Command::new("mvn")
                .args(&args)
                .current_dir(&path)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn();

            let mut child = match child {
                Ok(c) => c,
                Err(e) => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: 1, total: 1,
                        module_name: "整项目".to_string(),
                        line: format!("❌ 启动 mvn 失败: {}", e),
                        kind: "error".to_string(),
                    });
                    emit_done(&app, false, start_all, None);
                    return;
                }
            };

            let stdout = child.stdout.take();
            let stderr = child.stderr.take();
            let app1 = app.clone();
            let app2 = app.clone();

            let h1 = stdout.map(|s| std::thread::spawn(move || {
                let reader = BufReader::new(s);
                for line in reader.lines().flatten() {
                    let _ = app1.emit("build-log", BuildLogEvent {
                        index: 1, total: 1,
                        module_name: "整项目".to_string(),
                        line, kind: "stdout".to_string(),
                    });
                }
            }));
            let h2 = stderr.map(|s| std::thread::spawn(move || {
                let reader = BufReader::new(s);
                for line in reader.lines().flatten() {
                    let _ = app2.emit("build-log", BuildLogEvent {
                        index: 1, total: 1,
                        module_name: "整项目".to_string(),
                        line, kind: "stderr".to_string(),
                    });
                }
            }));

            let status = child.wait();
            if let Some(h) = h1 { let _ = h.join(); }
            if let Some(h) = h2 { let _ = h.join(); }

            match status {
                Ok(s) if s.success() => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: 1, total: 1,
                        module_name: "整项目".to_string(),
                        line: "✅ 整项目构建成功".to_string(),
                        kind: "success".to_string(),
                    });
                    // 复制选中模块的 JAR
                    if let Some(ref out_dir) = output_dir {
                        for (mod_path, mod_name) in module_paths.iter().zip(module_names.iter()) {
                            let module_abs = path.join(mod_path);
                            if let Some(jar) = find_built_jar(&module_abs) {
                                match copy_jar_to_output(&jar, out_dir) {
                                    Ok(msg) => {
                                        let _ = app.emit("build-log", BuildLogEvent {
                                            index: 1, total: 1,
                                            module_name: mod_name.clone(),
                                            line: format!("📦 {}", msg),
                                            kind: "info".to_string(),
                                        });
                                        last_copy_result = Some(msg);
                                    }
                                    Err(e) => {
                                        let _ = app.emit("build-log", BuildLogEvent {
                                            index: 1, total: 1,
                                            module_name: mod_name.clone(),
                                            line: format!("⚠️ 复制失败: {}", e),
                                            kind: "error".to_string(),
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                Ok(s) => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: 1, total: 1,
                        module_name: "整项目".to_string(),
                        line: format!("❌ 构建失败 (exit code: {})", s.code().unwrap_or(-1)),
                        kind: "error".to_string(),
                    });
                    all_success = false;
                }
                Err(e) => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: 1, total: 1,
                        module_name: "整项目".to_string(),
                        line: format!("❌ 进程错误: {}", e),
                        kind: "error".to_string(),
                    });
                    all_success = false;
                }
            }

            emit_done(&app, all_success, start_all, last_copy_result);
            return;
        }

        // "module" 或 "with-deps" 模式：逐模块构建
        let total = module_paths.len();

        for (i, (mod_path, mod_name)) in module_paths.iter().zip(module_names.iter()).enumerate() {
            let _ = app.emit("build-log", BuildLogEvent {
                index: i + 1,
                total,
                module_name: mod_name.clone(),
                line: format!("═ 开始构建: {} ({})", mod_name, mod_path),
                kind: "info".to_string(),
            });

            let mut args = vec![
                "clean".to_string(),
                "package".to_string(),
                "-pl".to_string(),
                mod_path.clone(),
            ];

            // "with-deps" 模式加 -am
            if scope == "with-deps" {
                args.push("-am".to_string());
            }

            if !profile.is_empty() {
                args.push("-P".to_string());
                args.push(profile.clone());
            }

            if skip_tests {
                args.push("-DskipTests".to_string());
            }

            if let Some(ref extra) = extra_args {
                for arg in extra.split_whitespace() {
                    args.push(arg.to_string());
                }
            }

            // 启动 mvn 进程，pipe stdout/stderr
            let child = Command::new("mvn")
                .args(&args)
                .current_dir(&path)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn();

            let mut child = match child {
                Ok(c) => c,
                Err(e) => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: i + 1,
                        total,
                        module_name: mod_name.clone(),
                        line: format!("❌ 启动 mvn 失败: {}", e),
                        kind: "error".to_string(),
                    });
                    all_success = false;
                    break;
                }
            };

            // 实时读取 stdout
            let stdout = child.stdout.take();
            let stderr = child.stderr.take();

            let app_stdout = app.clone();
            let app_stderr = app.clone();
            let name_stdout = mod_name.clone();
            let name_stderr = mod_name.clone();
            let idx_stdout = i + 1;
            let idx_stderr = i + 1;
            let total_stdout = total;
            let total_stderr = total;

            let stdout_handle = stdout.map(|s| {
                std::thread::spawn(move || {
                    let reader = BufReader::new(s);
                    for line in reader.lines() {
                        if let Ok(line) = line {
                            let _ = app_stdout.emit("build-log", BuildLogEvent {
                                index: idx_stdout,
                                total: total_stdout,
                                module_name: name_stdout.clone(),
                                line,
                                kind: "stdout".to_string(),
                            });
                        }
                    }
                })
            });

            let stderr_handle = stderr.map(|s| {
                std::thread::spawn(move || {
                    let reader = BufReader::new(s);
                    for line in reader.lines() {
                        if let Ok(line) = line {
                            let _ = app_stderr.emit("build-log", BuildLogEvent {
                                index: idx_stderr,
                                total: total_stderr,
                                module_name: name_stderr.clone(),
                                line,
                                kind: "stderr".to_string(),
                            });
                        }
                    }
                })
            });

            // 等待进程结束
            let status = child.wait();
            if let Some(h) = stdout_handle { let _ = h.join(); }
            if let Some(h) = stderr_handle { let _ = h.join(); }

            match status {
                Ok(s) if s.success() => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: i + 1,
                        total,
                        module_name: mod_name.clone(),
                        line: format!("✅ {} 构建成功", mod_name),
                        kind: "success".to_string(),
                    });

                    // 复制 JAR 到输出目录
                    if let Some(ref out_dir) = output_dir {
                        let module_abs = path.join(mod_path);
                        if let Some(jar) = find_built_jar(&module_abs) {
                            match copy_jar_to_output(&jar, out_dir) {
                                Ok(msg) => {
                                    let _ = app.emit("build-log", BuildLogEvent {
                                        index: i + 1,
                                        total,
                                        module_name: mod_name.clone(),
                                        line: format!("📦 {}", msg),
                                        kind: "info".to_string(),
                                    });
                                    last_copy_result = Some(msg);
                                }
                                Err(e) => {
                                    let _ = app.emit("build-log", BuildLogEvent {
                                        index: i + 1,
                                        total,
                                        module_name: mod_name.clone(),
                                        line: format!("⚠️ 复制 JAR 失败: {}", e),
                                        kind: "error".to_string(),
                                    });
                                }
                            }
                        } else {
                            let _ = app.emit("build-log", BuildLogEvent {
                                index: i + 1,
                                total,
                                module_name: mod_name.clone(),
                                line: "⚠️ 未找到构建产物 (JAR)".to_string(),
                                kind: "error".to_string(),
                            });
                        }
                    }
                }
                Ok(s) => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: i + 1,
                        total,
                        module_name: mod_name.clone(),
                        line: format!("❌ {} 构建失败 (exit code: {})", mod_name, s.code().unwrap_or(-1)),
                        kind: "error".to_string(),
                    });
                    all_success = false;
                    if i + 1 < total {
                        let _ = app.emit("build-log", BuildLogEvent {
                            index: i + 1,
                            total,
                            module_name: mod_name.clone(),
                            line: format!("已跳过剩余 {} 个模块", total - i - 1),
                            kind: "info".to_string(),
                        });
                    }
                    break;
                }
                Err(e) => {
                    let _ = app.emit("build-log", BuildLogEvent {
                        index: i + 1,
                        total,
                        module_name: mod_name.clone(),
                        line: format!("❌ 进程错误: {}", e),
                        kind: "error".to_string(),
                    });
                    all_success = false;
                    break;
                }
            }
        }

        emit_done(&app, all_success, start_all, last_copy_result);
    });

    Ok(())
}

fn emit_done(app: &AppHandle, success: bool, start: std::time::Instant, copy_result: Option<String>) {
    let duration = start.elapsed().as_millis();
    let msg = if success {
        format!("🎉 构建成功！耗时: {}", format_duration(duration))
    } else {
        format!("构建失败，耗时: {}", format_duration(duration))
    };
    let _ = app.emit("build-done", BuildDoneEvent {
        success,
        duration_ms: duration,
        message: msg,
        copy_result,
    });
}

fn format_duration(ms: u128) -> String {
    if ms < 1000 {
        return format!("{}ms", ms);
    }
    let s = ms / 1000;
    if s < 60 {
        return format!("{}s", s);
    }
    let m = s / 60;
    format!("{}m {}s", m, s % 60)
}

#[tauri::command]
pub fn check_maven_available() -> Result<String, String> {
    let output = Command::new("mvn")
        .args(["--version"])
        .output()
        .map_err(|e| format!("Maven 不可用: {}", e))?;

    let version = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(version.lines().next().unwrap_or("unknown").to_string())
}
