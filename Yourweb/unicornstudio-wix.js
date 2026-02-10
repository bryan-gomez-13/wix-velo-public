(function () {
  if (customElements.get("unicornstudio-wix")) return;

  class UnicornStudioWix extends HTMLElement {
    connectedCallback() {
      if (this._mounted) return;
      this._mounted = true;

      // 🔹 CONFIGURACIÓN FIJA (edita aquí si quieres)
      var PROJECT_ID = "ohmse2RtGXKWtXNOL98B";
      var WIDTH = "100%";
      var HEIGHT = "100vh";

      // Create container
      var container = document.createElement("div");
      container.setAttribute("data-us-project", PROJECT_ID);
      container.style.width = WIDTH;
      container.style.height = HEIGHT;

      // Make it behave as background
      container.style.position = "absolute";
      container.style.inset = "0";
      container.style.zIndex = "0";

      this.style.position = "relative";
      this.style.display = "block";
      this.style.width = "100%";
      this.style.height = HEIGHT;
      this.style.overflow = "hidden";

      this.appendChild(container);

      // Load Unicorn Studio once
      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false };

        var script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js";

        script.onload = function () {
          if (window.UnicornStudio && window.UnicornStudio.init) {
            window.UnicornStudio.init();
          }
        };

        (document.head || document.body).appendChild(script);
      } else if (window.UnicornStudio.init) {
        window.UnicornStudio.init();
      }
    }
  }

  customElements.define("unicornstudio-wix", UnicornStudioWix);
})();
