/* Välittää Microsoftin kirjautumisvastauksen takaisin sovellukselle. */
(function () {
  "use strict";
  if (window.msalRedirectBridge && typeof window.msalRedirectBridge.broadcastResponseToMainFrame === "function") {
    window.msalRedirectBridge.broadcastResponseToMainFrame().catch(function () {
      window.location.replace("./");
    });
  } else {
    window.location.replace("./");
  }
})();
