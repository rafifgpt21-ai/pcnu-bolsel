import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "PCNU Bolaang Mongondow Selatan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const logoData = await readFile(
    join(process.cwd(), "public", "brand", "pcnu-bolsel-favicon.png"),
    "base64",
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fcf8fa 0%, #eef8f2 100%)",
          padding: "72px 96px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "46px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${logoData}`}
            alt=""
            width={190}
            height={190}
            style={{ borderRadius: "38px" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                color: "#016e45",
                fontSize: "72px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              PCNU BOLSEL
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: "670px",
                color: "#1b1b1d",
                fontSize: "27px",
                fontWeight: 600,
              }}
            >
              Pengurus Cabang Nahdlatul Ulama Bolaang Mongondow Selatan
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "52px",
            color: "#016e45",
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          Portal Resmi & Berita NU Bolsel
        </div>
      </div>
    ),
    size,
  );
}
