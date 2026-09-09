/**
 * Atelier Fallback Engine
 * Provides authentic, high-fashion South Asian styling consultations and sizing conversions
 * formatted to be clear, concise, direct, and actionable.
 */

export function generateAtelierFallback(userPrompt: string, customerContext: any): string {
  const promptLower = userPrompt.toLowerCase();
  const contextBust = customerContext?.measurements?.bust ? parseFloat(customerContext.measurements.bust) : null;

  // 1. Sizing Consultation
  const isSizingQuery = promptLower.includes('size') || 
    promptLower.includes('sizing') || 
    promptLower.includes('measurement') || 
    promptLower.includes('ease') || 
    promptLower.includes('bust') || 
    promptLower.includes('inch') || 
    promptLower.includes('alteration') || 
    promptLower.includes('tight') || 
    promptLower.includes('loose') ||
    promptLower.includes('fit');

  if (isSizingQuery) {
    let bustNum = contextBust;
    const match = userPrompt.match(/(\d{2}(?:\.\d)?)\s*(?:inch|inches|"?\s*bust|"?\s*chest)/i) ||
                  userPrompt.match(/bust(?:\s*is|\s*measures|\s*of)?\s*(\d{2}(?:\.\d)?)/i) ||
                  userPrompt.match(/(\d{2})\s*"/);
    if (match && match[1]) {
      bustNum = parseFloat(match[1]);
    }

    let recommendedSize = 'Size 38 (M)';
    let finishedGarmentBust = '40.5"';

    if (bustNum) {
      if (bustNum < 33) {
        recommendedSize = 'Size 32-34 (XS)';
        finishedGarmentBust = `${(bustNum + 2.5).toFixed(1)}"`;
      } else if (bustNum <= 35) {
        recommendedSize = 'Size 36 (S)';
        finishedGarmentBust = `${(bustNum + 2.5).toFixed(1)}"`;
      } else if (bustNum <= 37) {
        recommendedSize = 'Size 38 (M)';
        finishedGarmentBust = `${(bustNum + 2.5).toFixed(1)}"`;
      } else if (bustNum <= 39) {
        recommendedSize = 'Size 40 (L)';
        finishedGarmentBust = `${(bustNum + 2.5).toFixed(1)}"`;
      } else if (bustNum <= 41) {
        recommendedSize = 'Size 42 (XL)';
        finishedGarmentBust = `${(bustNum + 2.5).toFixed(1)}"`;
      } else if (bustNum <= 44) {
        recommendedSize = 'Size 44 (XXL)';
        finishedGarmentBust = `${(bustNum + 3).toFixed(1)}"`;
      } else {
        recommendedSize = 'Size 46 (3XL)';
        finishedGarmentBust = `${(bustNum + 3).toFixed(1)}"`;
      }
    }

    return `### 📏 Sizing & Fit Recommendation

* **Recommended Size:** **${recommendedSize}**
* **Body Bust:** ${bustNum ? `${bustNum}"` : '38" (reference)'}
* **Finished Garment Chest:** **${finishedGarmentBust}** (+2.5" ease)

#### Quick Tailoring Rules:
* **Stitched Kurta / Kameez:** Always needs **+2" to +2.5" ease** over skin bust because woven desi silks and georgettes have no elastane stretch.
* **Blouse / Choli:** Tailored snug with **+0.5" to +1" ease** (size up 1 size if ordering padded cups).
* **Lehenga Length:** Measure from navel to floor with your intended heel height.
* **Alteration Margin:** All our outfits include a **2-inch internal seam margin** on each side for effortless local tailoring.`;
  }

  // 2. Sangeet / Mehndi Event Styling
  if (promptLower.includes('sangeet') || promptLower.includes('mehndi') || promptLower.includes('dance') || promptLower.includes('sharara')) {
    return `### ✨ Sangeet & Mehndi Styling (Dancing Comfort & Glam)

* **Look 1 (Maximum Mobility):** Tier-flared georgette **Sharara set** with short kurti and antique gota patti border. Allows fluid dancing without tripping.
* **Look 2 (Festive Glam):** Lightweight **scalloped organza lehenga** paired with an abhla mirror-work choli that catches stage lights.
* **Color Palette:** Emerald green, chartreuse lime, or icy mint contrasted with a rani pink dupatta.
* **Jewelry & Footwear:** Lightweight Polki choker, statement jhumkas, and memory-foam padded juttis.`;
  }

  // 3. Haldi & Mayun Event Styling
  if (promptLower.includes('haldi') || promptLower.includes('mayun') || promptLower.includes('yellow') || promptLower.includes('pastel')) {
    return `### 🌿 Haldi & Mayun Styling (Fresh Pastels)

* **Look 1 (Daytime Ritual):** Mulmul **Lucknowi Chikankari anarkali** with delicate mukaish dots. Ultra-breathable and cooling.
* **Look 2 (Modern Festive):** Pre-draped floral organza saree in **Lemon Sorbet or Pistachio Mint**, skipping conventional harsh yellows.
* **Color Tip:** Creamy buttermilk or pastel lime photographs best in natural sunlight.
* **Jewelry:** Fresh floral hathphool (hand jewelry) or delicate seed-pearl studs with a loose textured braid.`;
  }

  // 4. Banarasi & Saree Blouse Consultation
  if (promptLower.includes('saree') || promptLower.includes('blouse') || promptLower.includes('banarasi') || promptLower.includes('neckline')) {
    return `### 🥻 Heirloom Saree & Blouse Guide

* **Sweetheart Neckline:** Best for showcasing polki or temple gold chokers without clashing with the saree border.
* **High Boat Neck with Keyhole Back:** Sculpted, modern profile with an open teardrop back.
* **Elbow-Length Sleeves:** Classic regal proportion; place the woven zari border right at the sleeve hem.
* **Blouse Construction:** Choose padded inner cups for heavy brocades to ensure a smooth, strap-free fit.`;
  }

  // 5. Men's Sherwani & Kurta Consultation
  if (promptLower.includes('groom') || promptLower.includes('men') || promptLower.includes('sherwani') || promptLower.includes('bundi') || promptLower.includes('kurta')) {
    return `### 🤵 Men's Royal Wardrobe (Sherwanis & Bundis)

* **Option 1:** Textured raw silk **Bundi (Nehru jacket)** over an asymmetric cowl-neck kurta with tapered churidar pants.
* **Option 2:** Minimalist **Sherwani in champagne ivory or sage** with subtle tone-on-tone resham embroidery.
* **Sizing Rule:** Sherwanis require **3.5" to 4" chest ease** over body measurement to fit comfortably over an inner kurta.
* **Accessories:** Tissue silk doshalla stole and a matching chanderi safa with a subtle brooch.`;
  }

  // 6. Default Atelier Overview
  return `### 🌸 Zari & Silk Atelier Recommendations

* **2025/2026 Trends:** Soft pastels (champagne ivory, sage, dusty rose), scalloped organza dupattas, and mukaish chikankari.
* **Sizing Rule:** Order stitched kurtas with **+2.5" ease** over your actual body bust measurement.
* **Boutique Seam Allowance:** Built-in **2-inch internal seam margins** for simple local alterations.`;
}
