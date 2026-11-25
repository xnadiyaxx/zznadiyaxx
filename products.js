/* =====================================================================
   NADIYA BOUTIQUE – TUOTTEET
   NadiyaPublisher-ohjelma kirjoittaa tämän tiedoston automaattisesti
   samasta tiedosta kuin products.json. Älä muokkaa käsin: muutokset
   katoavat seuraavassa julkaisussa.

   Kentät:
     id         tunnus, esim. "puku-014" (näkyy linkissä nadiya.fi/#puku-014)
     category   "naiset", "miehet" tai "korut"
     published  julkaisupäivä; uusimmat näytetään ensin, "Uusi"-merkki 30 pv
     sold       myyntipäivä tai null; myyty näkyy 30 pv ja poistuu sitten
     price      hinta euroina numerona tai null (= "Kysy hintaa")
     images     kuvat: small korttiin, large tuoteikkunaan; ensimmäinen on pääkuva
     name/desc  nimi ja kuvaus kolmella kielellä (fi, en, fa)
     source     hallintasovelluksen lähetyskansion nimi
   ===================================================================== */
window.NADIYA_PRODUCTS = [];
