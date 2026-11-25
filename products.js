/* =====================================================================
   NADIYA BOUTIQUE – TUOTTEET
   NadiyaPublisher-ohjelma kirjoittaa tämän tiedoston automaattisesti
   samasta tiedosta kuin products.json. Älä muokkaa käsin: muutokset
   katoavat seuraavassa julkaisussa.

   Kentät:
     id         tunnus, esim. "puku-014" (näkyy linkissä nadiya.fi/#puku-014)
     category   "naiset", "miehet" tai "korut"
     published  julkaisuaika; uusimmat näytetään ensin, "Uusi"-merkki 30 pv
     sold       myyntipäivä tai null; myyty näkyy 30 pv ja poistuu sitten
     price      hinta euroina numerona tai null (= "Kysy hintaa")
     images     kuvat: small korttiin, large tuoteikkunaan; ensimmäinen on pääkuva
     name/desc  nimi ja kuvaus kolmella kielellä (fi, en, fa)
     source     hallintasovelluksen lähetyskansion nimi
   ===================================================================== */
window.NADIYA_PRODUCTS = [
  {
    "id": "puku-003",
    "category": "naiset",
    "published": "2026-11-25T20.03.56\u002B02:00",
    "sold": null,
    "price": null,
    "source": "20261125-135235-2007",
    "images": [
      {
        "small": "images/products/puku-003-1-s.jpg",
        "large": "images/products/puku-003-1.jpg"
      }
    ],
    "name": {
      "fi": "Hazaragi Gulangar",
      "en": "Hazaragi Gulangar",
      "fa": "گل‌انگار هزارگی"
    },
    "desc": {
      "fi": "Hazaragi Gulangar – yhdistelmä aitoutta, taidetta ja kauneutta.",
      "en": "Hazaragi Gulangar – a blend of authenticity, art and beauty.",
      "fa": "گل‌انگار هزارگی ؛ تلفیقی از اصالت، هنر و زیبایی\uD83E\uDE77"
    }
  },
  {
    "id": "puku-002",
    "category": "miehet",
    "published": "2026-11-25T20.03.55\u002B02:00",
    "sold": null,
    "price": null,
    "source": "20261125-135042-e220",
    "images": [
      {
        "small": "images/products/puku-002-1-s.jpg",
        "large": "images/products/puku-002-1.jpg"
      }
    ],
    "name": {
      "fi": "Afganistanilaisen miehen vaatteet",
      "en": "Afghan Men\u0027s Clothing",
      "fa": "لباس مردانه افغانستانی"
    },
    "desc": {
      "fi": "Afganistanilainen mies: rohkea valinnoissaan, tyylikäs ulkoasultaan, vahva identiteetiltään – menneisyydestä tähän päivään.",
      "en": "The Afghan man: bold in his choices, stylish in appearance, strong in identity, from the past to today.",
      "fa": "مرد افغانستانی\nجسور در انتخاب،\nشیک در ظاهر،\nمحکم در هویت، از گذشته تا به امروز…"
    }
  },
  {
    "id": "koru-001",
    "category": "korut",
    "published": "2026-11-25T20.03.54\u002B02:00",
    "sold": null,
    "price": null,
    "source": "20261125-134740-59e7",
    "images": [
      {
        "small": "images/products/koru-001-1-s.jpg",
        "large": "images/products/koru-001-1.jpg"
      }
    ],
    "name": {
      "fi": "Tyylikäs koru",
      "en": "Elegant Jewellery Piece",
      "fa": "زیورآلات ظریف"
    },
    "desc": {
      "fi": "Eleganssi löytää merkityksensä yksityiskohdista. Erityinen asuste muuttaa yksinkertaisuuden kauneudeksi ja kauneuden pysyväksi.",
      "en": "Elegance finds its meaning in the details. A special accessory turns simplicity into beauty, and beauty into something lasting.",
      "fa": "ظرافت در جزئیات معنا پیدا می‌کند؛\nوقتی یک اکسسوری خاص، سادگی را به زیبایی و زیبایی را به ماندگاری تبدیل می‌کند\uD83E\uDE77\uD83D\uDC8E"
    }
  },
  {
    "id": "puku-001",
    "category": "naiset",
    "published": "2026-11-25T20.03.53\u002B02:00",
    "sold": null,
    "price": null,
    "source": "20261125-133126-668b",
    "images": [
      {
        "small": "images/products/puku-001-1-s.jpg",
        "large": "images/products/puku-001-1.jpg"
      },
      {
        "small": "images/products/puku-001-2-s.jpg",
        "large": "images/products/puku-001-2.jpg"
      },
      {
        "small": "images/products/puku-001-3-s.jpg",
        "large": "images/products/puku-001-3.jpg"
      }
    ],
    "name": {
      "fi": "Perinteinen afgaaninkleidi, punainen ja violetti",
      "en": "Traditional Afghan Dress, Red and Purple",
      "fa": "پیراهن سنتی افغانی سرخ و ارغوانی"
    },
    "desc": {
      "fi": "Perinteinen afgaanimekko punaisena ja purppuranpunaisena. Mekko on valmistettu ohuesta kuvioidusta kankaasta, jossa on kulta- ja hopeanvärisiä kuvioita. Helmojen ja hihojen reunat on koristeltu kultaisella kirjonnalla, ja vyötäröllä on kolikkokoristeita. Punaisessa rintamuksessa on kultainen kirjonta, hihat ovat väljät ja helma on laskostettu. Sopii juhliin, häihin ja vieraskäynneille.",
      "en": "A traditional Afghan dress in red and purple. It is made of a thin patterned fabric with gold and silver designs. The edges of the skirt and sleeves are decorated with gold embroidery, and the waist has coin decoration. The red bodice has gold embroidery, the sleeves are wide and the skirt is gathered. Suitable for celebrations, weddings and parties.",
      "fa": "پیراهن سنتی افغانی به رنگ سرخ و ارغوانی، از پارچهٔ نازک و نقش‌دار با نقش‌های طلایی و نقره‌ای. حاشیه‌های دامن و آستین‌ها با گلدوزی طلایی تزئین شده و دور کمر سکه‌دوزی دارد. سینهٔ پیراهن سرخ با گلدوزی طلایی، آستین‌های گشاد و دامن پرچین. مناسب برای جشن، عروسی و مهمانی."
    }
  }
];
