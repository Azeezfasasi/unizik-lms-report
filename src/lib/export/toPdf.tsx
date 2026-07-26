import fs from "fs";
import path from "path";
import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from "@react-pdf/renderer";
import { ReportExportPayload } from "./adapters";

const logoPath = path.join(process.cwd(), "public", "images", "unizik.png");
let universityLogo: string | undefined;
try {
  const logoBuffer = fs.readFileSync(logoPath);
  universityLogo = `data:image/png;base64,${logoBuffer.toString("base64")}`;
} catch {
  universityLogo = undefined;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  logo: { width: 60, height: 60, marginRight: 12 },
  headerText: { flex: 1 },
  universityName: { fontSize: 16, fontWeight: 700, color: "#0F766E" },
  title: { fontSize: 20, fontWeight: 700, color: "#0F766E", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#64748B", marginBottom: 16, fontStyle: "italic" },
  metaRow: { flexDirection: "row", marginBottom: 4 },
  metaLabel: { fontWeight: 700, width: 160 },
  sectionHeading: { fontSize: 14, fontWeight: 700, color: "#0F766E", marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { fontWeight: 700, width: 160 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#0F766E", padding: 4 },
  tableHeaderCell: { flex: 1, color: "#FFFFFF", fontWeight: 700, fontSize: 9 },
  tableRow: { flexDirection: "row", padding: 4, borderBottom: "1 solid #E5E7EB" },
  tableCell: { flex: 1, fontSize: 9 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#94A3B8" },
});

function ReportDocument({ payload }: { payload: ReportExportPayload }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {universityLogo && (
            /* eslint-disable-next-line jsx-a11y/alt-text */
            <Image style={styles.logo} src={universityLogo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.universityName}>Nnamdi Azikiwe University</Text>
            <Text style={styles.title}>{payload.title}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{payload.subtitle}</Text>

        {payload.meta.map((item, i) => (
          <View key={i} style={styles.metaRow}>
            <Text style={styles.metaLabel}>{item.label}</Text>
            <Text>{item.value}</Text>
          </View>
        ))}

        {payload.sections.map((section, i) => (
          <View key={i}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.rows.map((item, j) => (
              <View key={j} style={styles.row}>
                <Text style={styles.label}>{item.label}</Text>
                <Text>{item.value}</Text>
              </View>
            ))}
            {section.table && section.table.rows.length > 0 && (
              <View>
                <View style={styles.tableHeaderRow}>
                  {section.table.headers.map((h, k) => (
                    <Text key={k} style={styles.tableHeaderCell}>{h}</Text>
                  ))}
                </View>
                {section.table.rows.map((row, k) => (
                  <View key={k} style={styles.tableRow}>
                    {row.map((cell, l) => (
                      <Text key={l} style={styles.tableCell}>{cell}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer}>Generated on {payload.generatedAt.toLocaleString()} - UNIZIK LMS Portal</Text>
      </Page>
    </Document>
  );
}

export async function buildPdfBuffer(payload: ReportExportPayload): Promise<Buffer> {
  return renderToBuffer(<ReportDocument payload={payload} />);
}
