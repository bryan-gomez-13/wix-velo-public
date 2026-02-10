(function () {
    // Avoid redefining the element
    if (customElements.get("unicornstudio-wix")) return;

    class UnicornStudioWix extends HTMLElement {
        connectedCallback() {
            // Prevent double init
            if (this._initialized) return;
            this._initialized = true;

            const projectId = this.getAttribute("project-id");
            const width = this.getAttribute("width") || "1440px";
            const height = this.getAttribute("height") || "900px";

            if (!projectId) {
                this.innerHTML = "<p style='color:red'>Missing project-id attribute</p>";
                return;
            }

            // Create container
            const container = document.createElement("div");
            container.setAttribute("data-us-project", projectId);
            container.style.width = width;
            container.style.height = height;

            this.appendChild(container);

            // Load UnicornStudio script only once
            if (!window.UnicornStudio) {
                window.UnicornStudio = { isInitialized: false };

                const script = document.createElement("script");
                script.src =
                    "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js";

                script.onload = () => {
                    this.initUnicorn();
                };

                (document.head || document.body).appendChild(script);
            } else {
                this.initUnicorn();
            }
        }

        initUnicorn() {
            if (window.UnicornStudio && window.UnicornStudio.init) {
                if (!window.UnicornStudio.isInitialized) {
                    window.UnicornStudio.isInitialized = true;
                    window.UnicornStudio.init();
                }
            }
        }
    }

    customElements.define("unicornstudio-wix", UnicornStudioWix);
})();
