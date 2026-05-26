import { jsPDF } from 'jspdf';

export async function generateTicketPDF(booking: any, activity: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create A4 document in points
      const doc = new jsPDF({ format: 'a4', unit: 'pt' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Styling Colors
      const gold = '#d4a045';
      const dark = '#1a1612';
      const gray = '#645c55';

      // --- Header Background ---
      doc.setFillColor(dark);
      doc.rect(0, 0, pageWidth, 140, 'F');
      
      // --- Header Title ---
      doc.setTextColor(gold);
      doc.setFontSize(28);
      // characterSpacing isn't easily supported in basic jsPDF text, so we just center it
      doc.text('DUBAI ADVENTURES', pageWidth / 2, 60, { align: 'center' });
         
      doc.setTextColor('#ffffff');
      doc.setFontSize(12);
      doc.text('OFFICIAL BOOKING VOUCHER', pageWidth / 2, 95, { align: 'center' });

      // --- Main Booking Header ---
      doc.setTextColor(gold);
      doc.setFontSize(20);
      doc.text('Booking Confirmation', 50, 180);
      
      doc.setTextColor(gray);
      doc.setFontSize(10);
      doc.text(`Booking Reference: ${booking._id?.toString().toUpperCase() || 'PENDING'}`, 50, 205);
      doc.text(`Booking Date: ${new Date().toLocaleDateString()}`, 50, 220);

      // --- Divider ---
      doc.setDrawColor(gold);
      doc.line(50, 240, pageWidth - 50, 240);

      // --- Guest Information ---
      doc.setTextColor(gold);
      doc.setFontSize(14);
      doc.text('Guest Information', 50, 270);
      
      doc.setTextColor(dark);
      doc.setFontSize(11);
      doc.text(`Name: ${booking.fullName}`, 50, 295);
      doc.text(`Email: ${booking.email}`, 50, 315);
      doc.text(`Phone: ${booking.phone || 'N/A'}`, 50, 335);
      const childrenText = booking.children > 0 ? `, ${booking.children} Children` : '';
      doc.text(`Guests: ${booking.adults} Adults${childrenText}`, 50, 355);

      // --- Experience Details ---
      doc.setTextColor(gold);
      doc.setFontSize(14);
      doc.text('Experience Details', 300, 270);
      
      doc.setTextColor(dark);
      doc.setFontSize(11);
      
      const title = activity.title || booking.activityTitle;
      const splitTitle = doc.splitTextToSize(`Package: ${title}`, 240);
      doc.text(splitTitle, 300, 295);
      
      // Calculate how many lines the title took to adjust the Y for next items
      const titleHeight = splitTitle.length * 15;
      let currentY = 295 + titleHeight;
      
      doc.text(`Date format: ${new Date(booking.date).toLocaleDateString()}`, 300, currentY);
      currentY += 20;
      doc.text(`Time: ${booking.timeSlot || 'Not Specified'}`, 300, currentY);
      currentY += 20;
      
      if (booking.selectedTransportId) {
        doc.text(`Transport: Included (Transfer Selected)`, 300, currentY);
      }

      // --- Divider ---
      doc.setDrawColor(gold);
      doc.line(50, 410, pageWidth - 50, 410);

      // --- Itinerary / Instructions ---
      doc.setTextColor(gold);
      doc.setFontSize(14);
      doc.text('Meeting & Important Instructions', 50, 440);
      
      doc.setTextColor(gray);
      doc.setFontSize(10);
      
      const instructions = activity.location?.details || 
        "Please arrive 15 minutes prior to your scheduled time. Present this digital voucher on your phone or printed upon arrival. For any assistance, please contact our VIP support team.";
      
      const splitInstructions = doc.splitTextToSize(instructions, pageWidth - 100);
      doc.text(splitInstructions, 50, 465);

      // --- Total Paid ---
      doc.setTextColor(dark);
      doc.setFontSize(16);
      doc.text(`Total Paid: AED ${booking.totalPrice.toLocaleString()}`, pageWidth - 50, 620, { align: 'right' });

      // --- Footer ---
      doc.setFillColor(dark);
      doc.rect(0, pageHeight - 70, pageWidth, 70, 'F');
      
      doc.setTextColor(gold);
      doc.setFontSize(10);
      doc.text('Thank you for choosing Dubai Adventures Elite.', pageWidth / 2, pageHeight - 40, { align: 'center' });
      
      doc.setTextColor('#ffffff');
      doc.text('For support, contact us at bookings@dubaiadventures.com or +971 50 123 4567', pageWidth / 2, pageHeight - 20, { align: 'center' });

      // Output as Node Buffer
      const arrayBuffer = doc.output('arraybuffer');
      const buffer = Buffer.from(arrayBuffer);
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}
