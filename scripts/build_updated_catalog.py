from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


NAVY = colors.HexColor("#121A3A")
PURPLE = colors.HexColor("#5B35D5")
BLUE = colors.HexColor("#1956D1")
CYAN = colors.HexColor("#0EA5A8")
PALE = colors.HexColor("#F4F6FB")
MID = colors.HexColor("#64748B")
INK = colors.HexColor("#172033")
LINE = colors.HexColor("#DCE3EE")
WHITE = colors.white


SECTION_BADGES = {
    "DERMATOLOGY / SKIN CARE": "Dermatology & Skin Care",
    "TABLETS": "Tablets",
    "CAPSULES / SOFTGELS": "Capsules & Softgels",
    "SYRUPS / ORAL LIQUIDS": "Syrups & Oral Liquids",
    "NUTRITION / PERSONAL CARE": "Nutrition & Personal Care",
    "AYUSH": "Ayush",
}


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "").replace("\n", " ")).strip()


def normalize_name(value: str) -> str:
    value = value.lower().replace("will ", "wil ")
    value = re.sub(r"\b(tablets?|capsules?|caps?|softgels?|cream|ointment|solution|syrup)\b", "", value)
    return re.sub(r"[^a-z0-9]", "", value)


def extract_master_list(source_pdf: Path) -> list[dict]:
    products: list[dict] = []
    current_section = ""
    with pdfplumber.open(source_pdf) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                for row in table:
                    first = clean(row[0] if row else "")
                    if first in SECTION_BADGES:
                        current_section = first
                        continue
                    if first in {"", "No."} or not first.isdigit():
                        continue
                    if not current_section:
                        raise ValueError(f"Product row {first} appeared before a section heading")
                    products.append(
                        {
                            "number": int(first),
                            "name": clean(row[1]),
                            "composition": clean(row[2]),
                            "packing": clean(row[3]),
                            "section": current_section,
                        }
                    )
    numbers = [p["number"] for p in products]
    if numbers != list(range(1, 63)):
        raise ValueError(f"Expected products 1-62, found {numbers}")
    return products


def web_category(product: dict) -> str:
    name = product["name"].lower()
    section = product["section"]
    if section == "TABLETS":
        return "tablets"
    if section == "CAPSULES / SOFTGELS":
        return "capsules"
    if section == "SYRUPS / ORAL LIQUIDS":
        return "syrups"
    if section == "AYUSH":
        return "ayurvedic"
    if section == "NUTRITION / PERSONAL CARE":
        return "nutraceuticals" if "protein" in name else "lotions"
    if "soap" in name:
        return "soaps"
    if "gel" in name or name == "adwil-c":
        return "gels"
    if "serum" in name or "solution" in name:
        return "serums"
    if "powder" in name:
        return "powders"
    if any(word in name for word in ("lotion", "shampoo", "wash")):
        return "lotions"
    return "creams"


def manufacturer(section: str) -> str:
    if section in {"DERMATOLOGY / SKIN CARE", "NUTRITION / PERSONAL CARE"}:
        return "Biowil Formulation"
    if section in {"TABLETS", "CAPSULES / SOFTGELS"}:
        return "Saavya Pharmaceuticals"
    return "Aries Drugs Pvt. Ltd."


def web_products(master: list[dict], old_products: list[dict]) -> list[dict]:
    old_by_key = {normalize_name(p["name"]): p for p in old_products}
    verified_images = {
        "Prin-G Lotion": "products/product_04.jpeg",
        "Prin-G Soap": "products/product_02.jpeg",
        "W-Bact Ointment": "products/product_07.jpeg",
        "Super-GM": "products/mockup_supergm_cream.jpg",
        "Ace-G Shampoo": "products/mockup_aceg_shampoo.jpg",
        "V-50 Sunscreen Lotion": "products/mockup_v50_sunscreen.jpg",
        "Hair Growth Serum": "products/mockup_hair_serum.jpg",
        "Wilace-SP": "products/mockup_wilace_sp.jpg",
        "Netika-P": "products/product_35.jpeg",
        "Wilcal": "products/product_51.jpeg",
        "Wildex-LB": "products/product_45.jpeg",
        "Bionerve-Forte": "products/product_28.jpeg",
        "Wilrab-DSR": "products/product_41.jpeg",
        "Prefast-DSR": "products/product_18.jpeg",
        "Prewil": "products/product_19.jpeg",
        "Prewil-OMG": "products/product_20.jpeg",
        "Wilcof-D": "products/mockup_wilcof_d.jpg",
        "Wilcof-A": "products/product_08.jpeg",
        "Wilcof-LS": "products/product_03.jpeg",
        "PRSM-6 Suspension": "products/product_05.jpeg",
    }
    result = []
    for p in master:
        key = normalize_name(p["name"])
        previous = old_by_key.get(key)
        category = web_category(p)
        badge = SECTION_BADGES[p["section"]]
        description = f"{p['composition']} in {p['packing']} commercial packing."
        image = verified_images.get(p["name"], "")
        mfg = manufacturer(p["section"])
        if previous:
            description = previous.get("description", description)
            mfg = previous.get("manufacturer", mfg)
            badge = previous.get("badge", badge)
        result.append(
            {
                "id": f"p{p['number']:02d}",
                "name": p["name"],
                "composition": p["composition"],
                "category": category,
                "packing": p["packing"],
                "badge": badge,
                "image": image,
                "imageVerified": bool(image),
                "description": description,
                "manufacturer": mfg,
                "marketer": "Will Healthcare Pvt. Ltd.",
                "catalogSection": p["section"],
            }
        )
    return result


def write_web_data(products: list[dict], json_path: Path, js_path: Path) -> None:
    payload = json.dumps(products, ensure_ascii=False, indent=2)
    json_path.write_text(payload + "\n", encoding="utf-8")
    js_path.write_text(
        "// Will Healthcare - Updated Master Product Catalog Data (62 Products)\n"
        f"const WILL_PRODUCTS = {payload};\n\n"
        "if (typeof window !== 'undefined') { window.WILL_PRODUCTS = WILL_PRODUCTS; }\n"
        "if (typeof module !== 'undefined' && module.exports) { module.exports = WILL_PRODUCTS; }\n",
        encoding="utf-8",
    )


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=29,
            textColor=NAVY,
            alignment=TA_CENTER,
            spaceAfter=5 * mm,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=15,
            textColor=PURPLE,
            alignment=TA_CENTER,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=21,
            textColor=NAVY,
            spaceAfter=4 * mm,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=PURPLE,
            spaceAfter=2 * mm,
        ),
        "h2_white": ParagraphStyle(
            "H2White",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=WHITE,
            spaceAfter=2 * mm,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=INK,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.2,
            leading=9.5,
            textColor=INK,
        ),
        "tiny": ParagraphStyle(
            "Tiny",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=6.5,
            leading=8,
            textColor=MID,
        ),
        "table": ParagraphStyle(
            "Table",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7,
            leading=8.5,
            textColor=INK,
        ),
        "table_brand": ParagraphStyle(
            "TableBrand",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=8.5,
            textColor=NAVY,
        ),
        "table_head": ParagraphStyle(
            "TableHead",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=8,
            textColor=WHITE,
            alignment=TA_LEFT,
        ),
    }


def safe_image(path: Path, width: float, height: float | None = None):
    if not path.exists():
        return Spacer(width, height or 1)
    image = Image(str(path), width=width, height=height)
    image.hAlign = "CENTER"
    return image


def page_decor(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setFillColor(NAVY)
        canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
        canvas.setFillColor(WHITE)
        canvas.setFont("Helvetica-Bold", 7.3)
        canvas.drawString(17 * mm, A4[1] - 7.5 * mm, "WILL HEALTHCARE PVT. LTD. | UPDATED PCD PRODUCT CATALOG")
        canvas.setFont("Helvetica", 7)
        canvas.drawRightString(A4[0] - 17 * mm, A4[1] - 7.5 * mm, "62-PRODUCT MASTER LIST")
        canvas.setStrokeColor(LINE)
        canvas.line(17 * mm, 12 * mm, A4[0] - 17 * mm, 12 * mm)
        canvas.setFillColor(MID)
        canvas.setFont("Helvetica", 6.5)
        canvas.drawString(17 * mm, 7.5 * mm, "Will Healthcare Pvt. Ltd. | PCD Partner Document")
        canvas.drawRightString(A4[0] - 17 * mm, 7.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def product_table(section_products: list[dict], st: dict):
    rows = [[
        Paragraph("NO.", st["table_head"]),
        Paragraph("BRAND NAME", st["table_head"]),
        Paragraph("COMPOSITION", st["table_head"]),
        Paragraph("PACK", st["table_head"]),
    ]]
    for p in section_products:
        rows.append([
            Paragraph(str(p["number"]), st["table"]),
            Paragraph(p["name"], st["table_brand"]),
            Paragraph(p["composition"], st["table"]),
            Paragraph(p["packing"], st["table"]),
        ])
    table = Table(rows, colWidths=[13 * mm, 43 * mm, 104 * mm, 22 * mm], repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
    ]
    for idx in range(1, len(rows)):
        style.append(("BACKGROUND", (0, idx), (-1, idx), WHITE if idx % 2 else PALE))
    table.setStyle(TableStyle(style))
    return table


def info_card(title: str, body: str, st: dict, width=86 * mm):
    content = [[Paragraph(title, st["h2"])], [Paragraph(body, st["small"])]]
    table = Table(content, colWidths=[width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def build_pdf(master: list[dict], output_pdf: Path, assets_dir: Path) -> None:
    output_pdf.parent.mkdir(parents=True, exist_ok=True)
    st = styles()
    doc = SimpleDocTemplate(
        str(output_pdf),
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=18 * mm,
        bottomMargin=16 * mm,
        title="Will Healthcare Updated PCD Product Catalog - 62 Products",
        author="Will Healthcare Pvt. Ltd.",
        subject="Updated PCD franchise product portfolio",
    )
    story = []

    story.append(Spacer(1, 12 * mm))
    story.append(safe_image(assets_dir / "will_logo_transparent.png", 58 * mm, 32 * mm))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("OFFICIAL PCD PHARMA FRANCHISE<br/>PRODUCT CATALOG", st["title"]))
    story.append(Paragraph("UPDATED 62-PRODUCT MASTER PORTFOLIO", st["subtitle"]))
    story.append(Spacer(1, 7 * mm))
    cover_line = Table([[""]], colWidths=[130 * mm], rowHeights=[1.2 * mm])
    cover_line.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PURPLE)]))
    story.append(cover_line)
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(
        "Dermatology & Skin Care | Tablets | Capsules & Softgels | Oral Liquids | Nutrition | Ayush",
        ParagraphStyle("CoverCategories", parent=st["body"], alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=10, leading=15, textColor=NAVY),
    ))
    story.append(Spacer(1, 9 * mm))
    stats = Table([
        [Paragraph("62", st["title"]), Paragraph("6", st["title"]), Paragraph("PAN-INDIA", st["title"])],
        [Paragraph("CURRENT PRODUCTS", st["tiny"]), Paragraph("PRODUCT GROUPS", st["tiny"]), Paragraph("PCD SUPPORT", st["tiny"])],
    ], colWidths=[55 * mm, 55 * mm, 55 * mm])
    stats.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(stats)
    story.append(Spacer(1, 19 * mm))
    story.append(Paragraph("PCD FRANCHISE & DISTRICT MONOPOLY OPPORTUNITIES", st["subtitle"]))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(
        "Will House, Lane Number 11, Clement Town, Dehradun, Uttarakhand 248002<br/>"
        "Phone: +91 79068 85742 &nbsp;&nbsp;|&nbsp;&nbsp; Email: willhealthcare84@gmail.com",
        ParagraphStyle("CoverContact", parent=st["small"], alignment=TA_CENTER, leading=12),
    ))
    story.append(PageBreak())

    story.append(Paragraph("PCD FRANCHISE PARTNERSHIP", st["h1"]))
    story.append(Paragraph(
        "Will Healthcare supports pharma distributors, medical representatives, stockists and entrepreneurs with a focused product portfolio and district-level franchise opportunities.",
        st["body"],
    ))
    story.append(Spacer(1, 5 * mm))
    cards = [
        info_card("District Monopoly Rights", "Territory-focused distribution opportunities subject to commercial confirmation and documentation.", st),
        info_card("Direct Business Support", "Product information, promotional coordination and franchise enquiry support from the Will Healthcare team.", st),
        info_card("Current 62-Product Range", "A consolidated master list across dermatology, tablets, capsules, oral liquids, nutrition, personal care and Ayush.", st),
        info_card("Packing Information", "Each listing includes the current composition and pack details supplied in the approved master list.", st),
    ]
    story.append(Table([[cards[0], cards[1]], [cards[2], cards[3]]], colWidths=[88 * mm, 88 * mm], hAlign="CENTER", style=[
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(Spacer(1, 7 * mm))
    story.append(Paragraph("How to Start", st["h1"]))
    steps = [
        ["1", "Share your target district and preferred product categories."],
        ["2", "Submit applicable wholesale drug licence and GST documentation."],
        ["3", "Confirm product selection, commercial terms and territory availability."],
        ["4", "Complete onboarding and coordinate stock dispatch and promotional support."],
    ]
    step_rows = [[Paragraph(f"<b>{n}</b>", st["body"]), Paragraph(text, st["body"])] for n, text in steps]
    step_table = Table(step_rows, colWidths=[12 * mm, 164 * mm])
    step_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), PURPLE),
        ("TEXTCOLOR", (0, 0), (0, -1), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(step_table)

    grouped = {}
    for p in master:
        grouped.setdefault(p["section"], []).append(p)
    for section in SECTION_BADGES:
        story.append(PageBreak())
        story.append(Paragraph(SECTION_BADGES[section].upper(), st["h1"]))
        story.append(Paragraph(f"{len(grouped[section])} products in the updated master list", st["tiny"]))
        story.append(Spacer(1, 3 * mm))
        story.append(product_table(grouped[section], st))

    story.append(PageBreak())
    story.append(Paragraph("JOIN THE WILL HEALTHCARE FRANCHISE NETWORK", st["h1"]))
    story.append(Paragraph(
        "Discuss product availability, commercial terms and district monopoly opportunities directly with the Will Healthcare team.",
        st["body"],
    ))
    story.append(Spacer(1, 6 * mm))
    contact = Table([
        [Paragraph("CORPORATE OFFICE", st["h2_white"]), Paragraph("CONTACT", st["h2_white"])],
        [
            Paragraph("Will House, Lane Number 11, Clement Town, Dehradun, Uttarakhand 248002", st["body"]),
            Paragraph("Phone / WhatsApp: +91 79068 85742<br/>Email: willhealthcare84@gmail.com<br/>Web: www.will.org.in", st["body"]),
        ],
    ], colWidths=[90 * mm, 86 * mm])
    contact.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BACKGROUND", (0, 1), (-1, 1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(contact)
    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph("IMPORTANT PRODUCT NOTE", st["h2"]))
    story.append(Paragraph(
        "This catalog reproduces the updated product information supplied for Will Healthcare. Product availability, formula, regulatory status, packaging and artwork should be reconfirmed before order placement, manufacture or printing. This document is intended for authorized trade and franchise enquiries.",
        st["small"],
    ))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("© 2026 Will Healthcare Pvt. Ltd. All rights reserved.", st["tiny"]))

    doc.build(story, onFirstPage=page_decor, onLaterPages=page_decor)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-pdf", type=Path, required=True)
    parser.add_argument("--old-json", type=Path, required=True)
    parser.add_argument("--output-json", type=Path, required=True)
    parser.add_argument("--output-js", type=Path, required=True)
    parser.add_argument("--output-pdf", type=Path, required=True)
    parser.add_argument("--assets-dir", type=Path, required=True)
    args = parser.parse_args()

    master = extract_master_list(args.source_pdf)
    old_products = json.loads(args.old_json.read_text(encoding="utf-8"))
    products = web_products(master, old_products)
    write_web_data(products, args.output_json, args.output_js)
    build_pdf(master, args.output_pdf, args.assets_dir)
    print(f"Generated {len(products)} web products and {args.output_pdf}")


if __name__ == "__main__":
    main()
