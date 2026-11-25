/* =====================================================================
   Nadiya Product Manager – asetukset
   =====================================================================
   clientId    Microsoft Entrasta saatu "Sovelluksen (asiakkaan) tunnus".
               Liitä se lainausmerkkien väliin. Tunnus ei ole salasana,
               joten sen saa julkaista. Ohje: OHJE.md, vaihe 1.
   ===================================================================== */
window.NPM_CONFIG = {
  clientId: "b0aa19dc-de91-4e76-80b9-30068b3e45d6",

  // Vain henkilökohtaiset Microsoft-tilit (Outlook, Hotmail, Live jne.)
  authority: "https://login.microsoftonline.com/consumers",

  // Sovellus näkee OneDrivesta vain oman kansionsa (Sovellukset/<sovelluksen nimi>)
  scopes: ["Files.ReadWrite.AppFolder"],

  maxImages: 10,        // kuvia enintään yhdessä tuotteessa
  imageMaxSide: 1600,   // kuvan pidempi sivu pikseleinä lähetettäessä
  imageQuality: 0.85    // JPEG-laatu 0–1
};
