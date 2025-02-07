"use server";
export async function GET() {
  const res = [
    {
      url: "https://github.com/kubotama/linkpage",
      title: "kubotama/linkpage",
    },
    {
      url: "https://www.google.com/",
      title: "Google",
    },
    {
      url: "https://mail.google.com",
      title: "Gmail",
    },
    {
      url: "https://www.amazon.co.jp/",
      title: "Amazon",
    },
  ];

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
