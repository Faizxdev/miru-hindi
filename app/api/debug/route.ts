import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: any = {};

  // Test 1: Native fetch with browser headers
  try {
    const res1 = await fetch("https://animesalt.cx/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      },
      next: { revalidate: 0 }
    });
    const html1 = await res1.text();
    results.test1_fetch_page = {
      status: res1.status,
      server: res1.headers.get("server"),
      cf_mitigated: res1.headers.get("cf-mitigated"),
      title: html1.match(/<title>(.*?)<\/title>/i)?.[1] || "no title",
      length: html1.length
    };
  } catch (err: any) {
    results.test1_fetch_page = { error: err.message };
  }

  // Test 2: Native fetch AJAX call
  try {
    const payload = new URLSearchParams({
      action: "torofilm_infinite_scroll",
      page: "1",
      per_page: "12",
      query_type: "archive",
      post_type: "series"
    });
    const res2 = await fetch("https://animesalt.cx/wp-admin/admin-ajax.php", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://animesalt.cx",
        "Referer": "https://animesalt.cx/series/",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
      },
      body: payload.toString(),
      next: { revalidate: 0 }
    });
    const text2 = await res2.text();
    results.test2_fetch_ajax = {
      status: res2.status,
      server: res2.headers.get("server"),
      cf_mitigated: res2.headers.get("cf-mitigated"),
      length: text2.length,
      sample: text2.slice(0, 150)
    };
  } catch (err: any) {
    results.test2_fetch_ajax = { error: err.message };
  }

  return NextResponse.json(results);
}
