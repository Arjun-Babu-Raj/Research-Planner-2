
"use client";

import { useState, useTransition } from 'react';
import { AppHeader } from '@/components/header';
import { StudySectionCard } from '@/components/study-section-card';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { generatePisAndConsentAction } from '@/app/actions';


// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const SECTIONS = {
  Introduction: {
    title: 'Introduction',
    description: 'Synthesize the literature review to provide context and rationale for your study.'
  },
  LiteratureReview: {
    title: 'Review of Literature',
    description: 'Retrieve and summarize relevant articles from PubMed & Google Scholar to build a foundation for your study.'
  },
  Objectives: {
    title: 'SMART Objectives',
    description: 'Generate specific, measurable, achievable, relevant, and time-bound goals for your study.',
  },
  Methodology: {
    title: 'Study Design & Methodology',
    description: 'Define the overall study design and methodology based on your objectives.'
  },
  SampleSize: {
    title: 'Sample Size Statement',
    description: 'Define the required sample size and provide a justification based on power analysis.',
  },
  DataCollection: {
    title: 'Data Collection Plan',
    description: 'Outline the methods and instruments for collecting data.',
  },
  Analysis: {
    title: 'Analysis Plan',
    description: 'Detail the statistical or qualitative methods you will use to analyze your data.',
  },
};

type SectionKey = keyof typeof SECTIONS;

const EXPORT_ORDER: SectionKey[] = [
  'Introduction',
  'LiteratureReview',
  'Objectives',
  'Methodology',
  'SampleSize',
  'DataCollection',
  'Analysis'
];

const parseMarkdownTable = (markdown: string): { headers: string[]; rows: string[][] } | null => {
    if (!markdown || !markdown.includes('|')) return null;

    const lines = markdown.trim().split('\n').filter(line => line.includes('|'));
    if (lines.length < 2) return null; // Header and separator line

    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    
    const rows = lines.slice(2).map(line => 
        line.split('|').map(cell => cell.trim()).filter(h => h)
    ).filter(row => row.length > 0 && row.length <= headers.length);


    if (headers.length === 0 || rows.length === 0) return null;
    
    // Pad rows that have fewer cells than headers
    const paddedRows = rows.map(row => {
        while (row.length < headers.length) {
            row.push('');
        }
        return row;
    });

    return { headers, rows: paddedRows };
};


export function Dashboard() {
  const [studyTitle, setStudyTitle] = useState(''); // Default title
  const [apiKey, setApiKey] = useState('');
  const [clearCounter, setClearCounter] = useState(0);
  const [isGeneratingProformas, startGeneratingProformas] = useTransition();
  const { toast } = useToast();

  const handleClearWorkspace = () => {
    if (!studyTitle) return;

    Object.keys(SECTIONS).forEach(sectionKey => {
      const storageKey = `research-planner-${studyTitle}-${sectionKey}`;
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-critique`);
    });
    
    // Trigger a re-render of the cards to clear their state
    setClearCounter(prev => prev + 1);
  };

  const getDependencyContent = (depSectionKey: SectionKey): string | null => {
      if (!studyTitle) return null;
      const key = `research-planner-${studyTitle}-${depSectionKey}`;
      return localStorage.getItem(key);
  };

  const downloadTextFile = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleGenerateProformas = () => {
        if (!studyTitle || !apiKey) {
            toast({ title: 'Study Title and API Key Required', description: 'Please ensure both are provided.', variant: 'destructive' });
            return;
        }
        const introduction = getDependencyContent('Introduction');
        const methodology = getDependencyContent('Methodology');
        const objectives = getDependencyContent('Objectives');

        if (!introduction || !methodology || !objectives) {
            toast({ title: 'Prerequisites Missing', description: 'Please generate the Introduction, Methodology, and Objectives sections first.', variant: 'destructive' });
            return;
        }

        startGeneratingProformas(async () => {
            toast({ title: 'Generating PIS & Consent...', description: 'This may take a moment.' });
            
            // Generate PIS and Consent
            const pisConsentResult = await generatePisAndConsentAction({
                studyTitle,
                investigatorName: "Student Investigator", // Placeholder, could be dynamic
                guideName: "Thesis Guide", // Placeholder
                introduction,
                methodology,
                objectives,
                apiKey,
            });

            if (pisConsentResult.success && pisConsentResult.data) {
                const { participantInformationSheet, consentForm } = pisConsentResult.data;
                
                // Download files
                downloadTextFile(participantInformationSheet.english, `${studyTitle}_PIS_EN.txt`);
                downloadTextFile(participantInformationSheet.hindi, `${studyTitle}_PIS_HI.txt`);
                downloadTextFile(consentForm.english, `${studyTitle}_Consent_EN.txt`);
                downloadTextFile(consentForm.hindi, `${studyTitle}_Consent_HI.txt`);
                toast({ title: 'Pro-formas Generated', description: 'Your files are downloading.' });
            } else {
                toast({ title: 'PIS/Consent Generation Failed', description: pisConsentResult.error, variant: 'destructive' });
            }
        });
    };

  const handleExport = () => {
    const doc = new jsPDF('p', 'pt', 'a4') as jsPDFWithAutoTable;
    
    doc.setFont('Helvetica');
    
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const MARGIN = 72; // 1 inch margin in points
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    let y = MARGIN;

    const toc: { title: string, page: number, level: number, y: number }[] = [];
    const references: string[] = [];
    
    const headingCounters = [0, 0, 0];

    const styles = {
        title: { fontSize: 24, fontStyle: 'bold', lineHeight: 1.2 },
        subtitle: { fontSize: 14, fontStyle: 'normal', lineHeight: 1.4 },
        h1: { fontSize: 16, fontStyle: 'bold', lineHeight: 1.5 },
        h2: { fontSize: 13, fontStyle: 'bold', lineHeight: 1.5 },
        h3: { fontSize: 12, fontStyle: 'bold', lineHeight: 1.5 },
        body: { fontSize: 12, fontStyle: 'normal', lineHeight: 1.5 },
        boldBody: { fontSize: 12, fontStyle: 'bold', lineHeight: 1.5 },
    };
    
    const addFooter = () => {
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            if (i === 1) continue;
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Research Planner', MARGIN, PAGE_HEIGHT - 30);
            doc.text(`Page ${i}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 30, { align: 'right' });
        }
    };

    const checkPageBreak = (currentY: number, requiredHeight: number) => {
        if (currentY + requiredHeight >= PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            return MARGIN;
        }
        return currentY;
    };

    const writeMarkdown = (markdown: string, startY: number) => {
        let currentY = startY;
        const lines = markdown.trim().split('\n');
        
        lines.forEach(line => {
            currentY += 4;
            let textLines: string[];
            
            // H3
            if (line.startsWith('### ')) {
                headingCounters[2]++;
                const text = `${headingCounters[0]}.${headingCounters[1]}.${headingCounters[2]} ${line.substring(4)}`;
                doc.setFont('Helvetica', styles.h3.fontStyle);
                doc.setFontSize(styles.h3.fontSize);
                textLines = doc.splitTextToSize(text, CONTENT_WIDTH);
                const requiredHeight = textLines.length * styles.h3.fontSize * styles.h3.lineHeight;
                currentY = checkPageBreak(currentY, requiredHeight);
                toc.push({ title: text, page: doc.internal.getNumberOfPages(), level: 3, y: currentY });
                doc.text(textLines, MARGIN, currentY, { lineHeightFactor: styles.h3.lineHeight });
                currentY += requiredHeight;
            }
            // H2
            else if (line.startsWith('## ')) {
                headingCounters[1]++;
                headingCounters[2] = 0; // Reset sub-counter
                const text = `${headingCounters[0]}.${headingCounters[1]} ${line.substring(3)}`;
                doc.setFont('Helvetica', styles.h2.fontStyle);
                doc.setFontSize(styles.h2.fontSize);
                textLines = doc.splitTextToSize(text, CONTENT_WIDTH);
                const requiredHeight = textLines.length * styles.h2.fontSize * styles.h2.lineHeight;
                currentY = checkPageBreak(currentY, requiredHeight);
                toc.push({ title: text, page: doc.internal.getNumberOfPages(), level: 2, y: currentY });
                doc.text(textLines, MARGIN, currentY, { lineHeightFactor: styles.h2.lineHeight });
                currentY += requiredHeight;
            }
            // H1
            else if (line.startsWith('# ')) {
                headingCounters[0]++;
                headingCounters[1] = 0;
                headingCounters[2] = 0;
                const text = `${headingCounters[0]}. ${line.substring(2)}`;
                doc.setFont('Helvetica', styles.h1.fontStyle);
                doc.setFontSize(styles.h1.fontSize);
                textLines = doc.splitTextToSize(text, CONTENT_WIDTH);
                const requiredHeight = textLines.length * styles.h1.fontSize * styles.h1.lineHeight;
                currentY = checkPageBreak(currentY, requiredHeight);
                toc.push({ title: text, page: doc.internal.getNumberOfPages(), level: 1, y: currentY });
                doc.text(textLines, MARGIN, currentY, { lineHeightFactor: styles.h1.lineHeight });
                currentY += requiredHeight;
            }
            // Bolded subheading (e.g., "**Subheading:**")
            else if (line.match(/^\s*\*{2}.+?\:{2}\s*$/)) {
                doc.setFont('Helvetica', styles.boldBody.fontStyle);
                doc.setFontSize(styles.boldBody.fontSize);
                textLines = doc.splitTextToSize(line.replace(/\*\*/g, ''), CONTENT_WIDTH);
                const requiredHeight = textLines.length * styles.boldBody.fontSize * styles.boldBody.lineHeight;
                currentY = checkPageBreak(currentY, requiredHeight);
                doc.text(textLines, MARGIN, currentY, {
                    lineHeightFactor: styles.boldBody.lineHeight,
                    maxWidth: CONTENT_WIDTH,
                    align: 'justify'
                });
                currentY += requiredHeight;
            }
             // Bolded subheading (e.g., "**Subheading:**")
            else if (line.match(/^\s*\*{2}[^\*]+?\*{2}\s*$/)) {
                 doc.setFont('Helvetica', styles.boldBody.fontStyle);
                 doc.setFontSize(styles.boldBody.fontSize);
                 textLines = doc.splitTextToSize(line.replace(/\*\*/g, ''), CONTENT_WIDTH);
                 const requiredHeight = textLines.length * styles.boldBody.fontSize * styles.boldBody.lineHeight;
                 currentY = checkPageBreak(currentY, requiredHeight);
                 doc.text(textLines, MARGIN, currentY, {
                     lineHeightFactor: styles.boldBody.lineHeight,
                     maxWidth: CONTENT_WIDTH,
                     align: 'justify'
                 });
                 currentY += requiredHeight;
            }
            // Bullet points
            else if (line.match(/^(\*|-)\s/)) {
                const bulletText = line.substring(2);
                doc.setFont('Helvetica', styles.body.fontStyle);
                doc.setFontSize(styles.body.fontSize);
                const bulletIndent = 20;
                textLines = doc.splitTextToSize(bulletText, CONTENT_WIDTH - bulletIndent);
                const requiredHeight = textLines.length * styles.body.fontSize * styles.body.lineHeight;
                currentY = checkPageBreak(currentY, requiredHeight);
                doc.text('\u2022', MARGIN, currentY, { baseline: 'top' });
                doc.text(textLines, MARGIN + bulletIndent, currentY, {
                    lineHeightFactor: styles.body.lineHeight,
                    maxWidth: CONTENT_WIDTH - bulletIndent,
                    align: 'justify'
                });
                currentY += requiredHeight;
            }
            // Numbered list (e.g., "1. ...")
            else if (line.match(/^\d+\.\s/)) {
                const itemText = line.substring(line.indexOf(' ') + 1);
                const itemNumber = line.substring(0, line.indexOf('.') + 1);
                const numberIndent = 20;
                doc.setFont('Helvetica', styles.body.fontStyle);
                doc.setFontSize(styles.body.fontSize);
                textLines = doc.splitTextToSize(itemText, CONTENT_WIDTH - numberIndent);
                const requiredHeight = textLines.length * styles.body.fontSize * styles.body.lineHeight;
                currentY = checkPageBreak(currentY, requiredHeight);
                doc.text(itemNumber, MARGIN, currentY, { baseline: 'top' });
                doc.text(textLines, MARGIN + numberIndent, currentY, {
                    lineHeightFactor: styles.body.lineHeight,
                    maxWidth: CONTENT_WIDTH - numberIndent,
                    align: 'justify'
                });
                currentY += requiredHeight;
            }
            // Normal body text
            else {
                if (line.trim() === '') {
                    currentY += styles.body.fontSize / 2; // Half line break for empty lines
                } else {
                    doc.setFont('Helvetica', 'normal');
                    doc.setFontSize(styles.body.fontSize);
                    textLines = doc.splitTextToSize(line, CONTENT_WIDTH);
                    const requiredHeight = textLines.length * styles.body.fontSize * styles.body.lineHeight;
                    currentY = checkPageBreak(currentY, requiredHeight);
                    doc.text(textLines, MARGIN, currentY, {
                        align: 'justify',
                        lineHeightFactor: styles.body.lineHeight,
                        maxWidth: CONTENT_WIDTH
                    });
                    currentY += requiredHeight;
                }
            }
        });
        return currentY;
    };
    
    // --- Phase 1: Document Construction ---
    // 1. Title Page
    doc.setFont('Helvetica', styles.title.fontStyle);
    doc.setFontSize(styles.title.fontSize);
    const titleToExport = studyTitle || "My Research Study";
    const titleLines = doc.splitTextToSize(titleToExport, CONTENT_WIDTH * 0.8); // Use 80% of width for better centering
    const titleX = PAGE_WIDTH / 2;
    let currentY = PAGE_HEIGHT / 4;
    doc.text(titleLines, titleX, currentY, { align: 'center' });
    
    currentY += (titleLines.length * styles.title.fontSize * styles.title.lineHeight) + 40;
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(180);
    doc.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);
    
    currentY += 40;

    doc.setFont('Helvetica', styles.subtitle.fontStyle);
    doc.setFontSize(styles.subtitle.fontSize);

    const subtitle1 = 'A Research Plan';
    doc.text(subtitle1, titleX, currentY, { align: 'center' });
    currentY += styles.subtitle.fontSize * styles.subtitle.lineHeight;

    doc.setFontSize(12);
    const subtitle2 = 'Generated by Research Planner';
    doc.text(subtitle2, titleX, currentY, { align: 'center' });
    
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(date, titleX, PAGE_HEIGHT - (MARGIN * 1.5) , { align: 'center' });
    
    // Add a blank page for the Table of Contents
    doc.addPage();
    const tocPage = 2;
    
    // --- Phase 2: Main Content ---
    EXPORT_ORDER.forEach((key) => {
        const sectionDetails = SECTIONS[key];
        if (!sectionDetails) return;

        doc.addPage();
        y = MARGIN;
        
        headingCounters[0]++;
        headingCounters[1] = 0;
        headingCounters[2] = 0;
        const mainHeadingText = `${headingCounters[0]}. ${sectionDetails.title}`;
        
        doc.setFont('Helvetica', styles.h1.fontStyle);
        doc.setFontSize(styles.h1.fontSize);
        toc.push({ title: mainHeadingText, page: doc.internal.getNumberOfPages(), level: 1, y: y});
        doc.text(mainHeadingText, MARGIN, y);
        y += styles.h1.fontSize * styles.h1.lineHeight;
        
        const storageKey = `research-planner-${studyTitle}-${key}`;
        const content = localStorage.getItem(storageKey) || 'No content generated.';

        if (key === 'LiteratureReview' && content !== 'No content generated.') {
            try {
                const litReviewData = JSON.parse(content);

                if (litReviewData.keyConcepts && Array.isArray(litReviewData.keyConcepts) && litReviewData.keyConcepts.length > 0) {
                    headingCounters[1]++;
                    const text = `${headingCounters[0]}.${headingCounters[1]} Key Concepts`;
                    doc.setFont('Helvetica', styles.h2.fontStyle);
                    doc.setFontSize(styles.h2.fontSize);
                    y = checkPageBreak(y, styles.h2.fontSize * styles.h2.lineHeight);
                    toc.push({ title: text, page: doc.internal.getNumberOfPages(), level: 2, y: y });
                    doc.text(text, MARGIN, y);
                    y += styles.h2.fontSize * styles.h2.lineHeight;
                    
                    litReviewData.keyConcepts.forEach((concept: any) => {
                        y = writeMarkdown(`### ${concept.concept}\n${concept.note}`, y);
                        y+= 4;
                    });
                }
                
                headingCounters[1]++;
                y = checkPageBreak(y, 20);
                const articleHeadingText = `${headingCounters[0]}.${headingCounters[1]} Article Summaries`;
                doc.setFont('Helvetica', styles.h2.fontStyle);
                doc.setFontSize(styles.h2.fontSize);
                toc.push({ title: articleHeadingText, page: doc.internal.getNumberOfPages(), level: 2, y: y });
                doc.text(articleHeadingText, MARGIN, y);
                y += styles.h2.fontSize * styles.h2.lineHeight;

                litReviewData.articles.forEach((a: any) => references.push(a.citation));
                doc.autoTable({
                    head: [['Title', 'Author', 'Year', 'Design', 'Summary']],
                    body: litReviewData.articles.map((a: any) => [a.title, a.author, a.year, a.studyDesign, a.summary]),
                    startY: y,
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                    headStyles: { fillColor: [7, 136, 135], fontStyle: 'bold' },
                    didDrawPage: (data: any) => { y = data.cursor?.y || y },
                    margin: { left: MARGIN, right: MARGIN },
                    tableWidth: CONTENT_WIDTH,
                });
                y = (doc as any).autoTable.previous.finalY;

            } catch (e) {
                 y = writeMarkdown("Error parsing literature review data.", y);
            }
        } else if (key === 'Analysis' && content.includes('|')) {
            const tableData = parseMarkdownTable(content);
            if (tableData && tableData.rows.length > 0) {
                 doc.autoTable({
                    head: [tableData.headers],
                    body: tableData.rows,
                    startY: y,
                    theme: 'grid',
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [7, 136, 135], fontStyle: 'bold' },
                    didDrawPage: (data) => { y = data.cursor?.y || y },
                    margin: { left: MARGIN, right: MARGIN },
                    tableWidth: CONTENT_WIDTH,
                });
                y = (doc as any).autoTable.previous.finalY;
            } else {
                 y = writeMarkdown(content, y);
            }
        } else {
            y = writeMarkdown(content, y);
        }
    });

    // --- Add References Section ---
    const appCitation = "B, Arjun., & Pakhare, Abhijit P. (2025). Research Planner (Version 2.0) [Web Application].";
    references.push(appCitation);

    if (references.length > 0) {
        doc.addPage();
        y = MARGIN;
        headingCounters[0]++;
        const refHeading = `${headingCounters[0]}. References`;
        doc.setFont('Helvetica', styles.h1.fontStyle);
        doc.setFontSize(styles.h1.fontSize);
        toc.push({ title: refHeading, page: doc.internal.getNumberOfPages(), level: 1, y: y });
        doc.text(refHeading, MARGIN, y);
        y += styles.h1.fontSize * styles.h1.lineHeight;
        
        doc.setFont('Helvetica', styles.body.fontStyle);
        doc.setFontSize(10);
        references.forEach((ref, index) => {
            const refText = `${index + 1}. ${ref}`;
            const refLines = doc.splitTextToSize(refText, CONTENT_WIDTH);
            const requiredHeight = refLines.length * 10 * styles.body.lineHeight;
            y = checkPageBreak(y, requiredHeight);
            doc.text(refLines, MARGIN, y, {lineHeightFactor: styles.body.lineHeight, maxWidth: CONTENT_WIDTH});
            y += requiredHeight;
        });
    }

    // --- Phase 3: Finalization ---
    // Generate Table of Contents
    doc.setPage(tocPage);
    let tocY = MARGIN;
    doc.setFont('Helvetica', styles.h1.fontStyle);
    doc.setFontSize(styles.h1.fontSize);
    doc.text("Contents", MARGIN, tocY);
    tocY += 40;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(styles.body.fontSize);
    doc.setTextColor(0, 0, 255); // Hyperlink color

    toc.forEach(item => {
        if (tocY > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            tocY = MARGIN;
        }

        const indent = (item.level - 1) * 20;
        const pageNumberStr = String(item.page);

        // Add the link to the title
        doc.textWithLink(item.title, MARGIN + indent, tocY, { pageNumber: item.page, y: item.y });

        // Calculate available space for dot leaders
        const titleWidth = doc.getTextWidth(item.title);
        const pageNumWidth = doc.getTextWidth(pageNumberStr);
        const dotWidth = doc.getTextWidth('.');
        const availableWidth = CONTENT_WIDTH - indent - pageNumWidth - 5; // 5 for buffer
        
        // Draw dot leaders
        doc.setTextColor(150);
        if (availableWidth > titleWidth) {
           const dotCount = Math.floor((availableWidth - titleWidth) / dotWidth);
           const dots = '.'.repeat(dotCount);
           doc.text(dots, MARGIN + indent + titleWidth + 2.5, tocY);
        }
        
        // Draw page number (without link)
        doc.setTextColor(0);
        doc.text(pageNumberStr, PAGE_WIDTH - MARGIN, tocY, { align: 'right' });

        tocY += 20; // Move to the next line
    });
    
    // Add footers to all pages except the first one
    addFooter();

    // Save the PDF
    doc.save(`${titleToExport.replace(/\s+/g, '_')}_study_plan.pdf`);
  };

  const ClearWorkspaceDialog = () => (
     <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" disabled={!studyTitle}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear Workspace</span>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This will permanently delete all content associated with the title "{studyTitle}" from your browser's local storage. This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearWorkspace}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader onExport={handleExport} apiKey={apiKey} onApiKeyChange={setApiKey} onGenerateProformas={handleGenerateProformas} isGeneratingProformas={isGeneratingProformas} />
      <main className="flex-grow container mx-auto px-4 py-8">
          <div>
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                 <Input
                    value={studyTitle}
                    onChange={(e) => setStudyTitle(e.target.value)}
                    placeholder="Enter your title here"
                    className="text-3xl font-headline font-bold mb-2 h-auto p-2 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent flex-grow"
                  />
                  <ClearWorkspaceDialog />
              </div>

              <p className="text-md text-muted-foreground">This is your research study workspace. Generate, refine, and validate each section below.</p>
               <div className="mt-4 text-sm text-muted-foreground bg-accent/20 p-3 rounded-lg border border-border/50">
                <p>For inspiration, you can explore the ICMR's repository of medical theses: <a href="https://www.icmr.gov.in/medical-shodhganga" target="_blank" rel="noopener noreferrer" className="text-primary underline">medical shodhganga/मेडिकल शोधगंगा</a>.</p>
                <p className="mt-1 text-xs">Medical Shodhganga is a joint initiative of ICMR-DHR, MoHFW, and NMC, containing over 1400 topics across 24 specialties.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(SECTIONS).map(([key, { title, description }]) => (
                <StudySectionCard
                  key={`${key}-${clearCounter}`}
                  sectionKey={key as SectionKey}
                  title={title}
                  description={description}
                  studyTitle={studyTitle}
                  apiKey={apiKey}
                />
              ))}
            </div>
          </div>
      </main>
       <footer className="bg-card border-t border-border/40 mt-12">
        <div className="container mx-auto px-4 py-8 text-muted-foreground text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-left">
              <h3 className="font-bold font-headline text-foreground mb-2">About the App</h3>
              <p>This application, **Research Planner**, is an interactive tool designed to assist students, researchers, and academics in drafting and refining a research study plan. It uses generative AI to help structure your thoughts and generate key sections of a research proposal.</p>
               <p className="mt-2"><strong>API Key Privacy:</strong> Your Gemini API key is not stored or saved. It is only used for your current session.</p>
            </div>
            <div className="text-left">
              <h3 className="font-bold font-headline text-foreground mb-2">Authors</h3>
              <p>Dr. Arjun B, Junior Resident, Department of Community and Family Medicine, AIIMS Bhopal.</p>
              <p>Professor (Dr.) Abhijit P Pakhare, Department of Community and Family Medicine, AIIMS Bhopal.</p>
            </div>
            <div className="text-left">
                <h3 className="font-bold font-headline text-foreground mb-2">How to Cite</h3>
                <p className="italic">B, Arjun., & Pakhare, Abhijit P. (2025). Research Planner (Version 2.0) [Web Application].</p>
                 <h3 className="font-bold font-headline text-foreground mt-4 mb-2">Contact</h3>
                <a href="mailto:arjun.unni16@gmail.com" className="hover:text-primary">arjun.unni16@gmail.com</a>
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-4 text-center">
            <p>&copy; 2025 Research Planner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
