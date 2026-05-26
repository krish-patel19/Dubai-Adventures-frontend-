"use client";

import React from 'react';

interface LegalContentProps {
  content: string;
}

export default function LegalContent({ content }: LegalContentProps) {
  if (!content) return null;

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    let htmlLines: string[] = [];
    let currentListType: 'ul' | 'ol' | null = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        if (currentListType) {
          htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>');
          currentListType = null;
        }
        return;
      }

      // Headers
      if (trimmedLine.startsWith('### ')) {
        if (currentListType) { htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>'); currentListType = null; }
        htmlLines.push(`<h3>${trimmedLine.replace('### ', '')}</h3>`);
      } else if (trimmedLine.startsWith('## ')) {
        if (currentListType) { htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>'); currentListType = null; }
        htmlLines.push(`<h2>${trimmedLine.replace('## ', '')}</h2>`);
      } else if (trimmedLine.startsWith('# ')) {
        if (currentListType) { htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>'); currentListType = null; }
        htmlLines.push(`<h1>${trimmedLine.replace('# ', '')}</h1>`);
      } 
      // Blockquotes
      else if (trimmedLine.startsWith('> ')) {
        if (currentListType) { htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>'); currentListType = null; }
        htmlLines.push(`<blockquote>${trimmedLine.replace('> ', '')}</blockquote>`);
      }
      // Horizontal Rule
      else if (trimmedLine === '---') {
        if (currentListType) { htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>'); currentListType = null; }
        htmlLines.push('<hr />');
      }
      // Lists (Numbered)
      else if (/^\d+\.\s+/.test(trimmedLine)) {
        if (currentListType !== 'ol') {
          if (currentListType === 'ul') htmlLines.push('</ul>');
          htmlLines.push('<ol>');
          currentListType = 'ol';
        }
        htmlLines.push(`<li>${trimmedLine.replace(/^\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`);
      }
      // Lists (Bullet)
      else if (/^[-*+]\s+/.test(trimmedLine)) {
        if (currentListType !== 'ul') {
          if (currentListType === 'ol') htmlLines.push('</ol>');
          htmlLines.push('<ul>');
          currentListType = 'ul';
        }
        htmlLines.push(`<li>${trimmedLine.replace(/^[-*+]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`);
      }
      // Paragraphs
      else {
        if (currentListType) {
          htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>');
          currentListType = null;
        }
        const bolded = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlLines.push(`<p>${bolded}</p>`);
      }
    });

    if (currentListType) htmlLines.push(currentListType === 'ul' ? '</ul>' : '</ol>');

    return htmlLines.join('\n');
  };

  return (
    <div className="relative group/content">
      {/* Decorative Luxury Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-[0.03] pointer-events-none select-none -z-10 group-hover/content:opacity-[0.05] transition-opacity duration-1000">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-primary">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" />
        </svg>
      </div>

      <div 
        className="legal-content"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }} 
      />

      {/* Luxury Footer Seal */}
      <div className="mt-20 flex flex-col items-center justify-center opacity-40">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mb-6" />
        <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="fd text-primary text-xs font-bold italic">DA</span>
          </div>
        </div>
        <p className="fd mt-4 text-xs tracking-[0.3em] uppercase text-primary-dark font-medium">Official Document</p>
      </div>
    </div>
  );
}
