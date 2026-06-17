use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;

#[derive(Deserialize)]
pub struct HttpRequestParams {
    pub method: String,
    pub url: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
}

#[derive(Serialize)]
pub struct HttpResponseResult {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub size: usize,
    pub time: u64,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn http_request(params: HttpRequestParams) -> HttpResponseResult {
    let start = Instant::now();

    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();

    let method = params.method.to_uppercase();
    let mut req = match method.as_str() {
        "GET" => client.get(&params.url),
        "POST" => client.post(&params.url),
        "PUT" => client.put(&params.url),
        "PATCH" => client.patch(&params.url),
        "DELETE" => client.delete(&params.url),
        "HEAD" => client.head(&params.url),
        "OPTIONS" => client.request(reqwest::Method::OPTIONS, &params.url),
        _ => client.get(&params.url),
    };

    // 添加 headers
    for (key, value) in &params.headers {
        // 跳过一些浏览器特有的 header
        let k = key.to_lowercase();
        if k == "host"
            || k == "origin"
            || k == "referer"
            || k == "sec-ch-ua"
            || k == "sec-ch-ua-mobile"
            || k == "sec-ch-ua-platform"
            || k == "sec-fetch-dest"
            || k == "sec-fetch-mode"
            || k == "sec-fetch-site"
            || k == "user-agent"
        {
            continue;
        }
        req = req.header(key.as_str(), value.as_str());
    }

    // 添加 body
    if let Some(body) = &params.body {
        if !body.is_empty() {
            // 检查是否是 form-urlencoded
            if params
                .headers
                .get("content-type")
                .or_else(|| params.headers.get("Content-Type"))
                .map(|v| v.contains("application/x-www-form-urlencoded"))
                .unwrap_or(false)
            {
                req = req.body(body.clone());
            } else {
                req = req.body(body.clone());
            }
        }
    }

    match req.send().await {
        Ok(resp) => {
            let time = start.elapsed().as_millis() as u64;
            let status = resp.status().as_u16();
            let status_text = resp
                .status()
                .canonical_reason()
                .unwrap_or("Unknown")
                .to_string();

            let mut resp_headers = HashMap::new();
            for (key, value) in resp.headers() {
                if let Ok(v) = value.to_str() {
                    resp_headers.insert(key.to_string(), v.to_string());
                }
            }

            match resp.text().await {
                Ok(body) => {
                    let size = body.len();
                    HttpResponseResult {
                        status,
                        status_text,
                        headers: resp_headers,
                        body,
                        size,
                        time,
                        error: None,
                    }
                }
                Err(e) => HttpResponseResult {
                    status,
                    status_text,
                    headers: resp_headers,
                    body: String::new(),
                    size: 0,
                    time,
                    error: Some(format!("读取响应失败: {}", e)),
                },
            }
        }
        Err(e) => HttpResponseResult {
            status: 0,
            status_text: "Error".to_string(),
            headers: HashMap::new(),
            body: String::new(),
            size: 0,
            time: start.elapsed().as_millis() as u64,
            error: Some(format!("请求失败: {}", e)),
        },
    }
}
