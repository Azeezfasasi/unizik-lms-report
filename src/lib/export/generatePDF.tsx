import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 8 },
  body: { fontSize: 12, marginBottom: 6 },
});

export function ReportPDFDocument({ reportId, notes }: { reportId: string; notes: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>UNIZIK Postgraduate Report</Text>
          <Text style={styles.body}>Report ID: {reportId}</Text>
          <Text style={styles.body}>{notes}</Text>
        </View>
      </Page>
    </Document>
  );
}
