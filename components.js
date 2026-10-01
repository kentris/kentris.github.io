document.addEventListener("DOMContentLoaded", function () {
  /*
   * Find the script that loaded this file.
   *
   * This allows us to determine the root of the GitHub Pages site
   * without hard-coding the repository name.
   *
   * Example:
   *
   * https://username.github.io/my-portfolio/components.js
   *
   * Site root becomes:
   *
   * https://username.github.io/my-portfolio/
   */

  const componentScript = document.querySelector(
    'script[src*="components.js"]',
  );

  if (!componentScript) {
    console.error("Could not find components.js script.");
    return;
  }

  const scriptUrl = new URL(
    componentScript.getAttribute("src"),
    window.location.href,
  );

  /*
   * The directory containing components.js is the root
   * of our website.
   */
  const siteRoot = new URL("./", scriptUrl);

  /*
   * ----------------------------------------
   * Load Header
   * ----------------------------------------
   */
  const headerContainer = document.getElementById("header");
  if (headerContainer) {
    const headerUrl = new URL("header.html", siteRoot);
    fetch(headerUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load header.html: " + response.status);
        }
        return response.text();
      })
      .then(function (html) {
        headerContainer.innerHTML = html;
        fixNavigationLinks();
        setActiveNavigation();
      })
      .catch(function (error) {
        console.error("Error loading header:", error);
      });
  }

  /*
   * ----------------------------------------
   * Load Footer
   * ----------------------------------------
   */
  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    const footerUrl = new URL("footer.html", siteRoot);
    fetch(footerUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load footer.html: " + response.status);
        }
        return response.text();
      })
      .then(function (html) {
        footerContainer.innerHTML = html;
      })
      .catch(function (error) {
        console.error("Error loading footer:", error);
      });
  }

  /*
   * ----------------------------------------
   * Fix Navigation Links
   * ----------------------------------------
   *
   * header.html contains:
   *
   *     href="index.html"
   *
   * regardless of where the current page lives.
   *
   * We convert those into absolute URLs based on
   * the actual site root.
   *
   * This fixes the problem where:
   *
   * /projects/arxiv-search.html
   *
   * would otherwise try to navigate to:
   *
   * /projects/index.html
   */
  function fixNavigationLinks() {
    const navigationLinks = document.querySelectorAll("header nav a");
    navigationLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }
      const absoluteUrl = new URL(href, siteRoot);
      link.href = absoluteUrl.href;
    });

    /*
     * Fix the site title separately.
     */
    const siteTitle = document.querySelector(".site-title");
    if (siteTitle) {
      siteTitle.href = new URL("index.html", siteRoot).href;
    }
  }

  /*
   * ----------------------------------------
   * Determine Active Navigation Item
   * ----------------------------------------
   */
  function setActiveNavigation() {
    const pathname = window.location.pathname;
    const currentFile = pathname.split("/").pop();

    let currentPage = null;

    if (currentFile === "" || currentFile === "index.html") {
      currentPage = "home";
    } else if (currentFile === "projects.html") {
      currentPage = "projects";
    } else if (currentFile === "cv.html") {
      currentPage = "cv";
    } else if (currentFile === "contact.html") {
      currentPage = "contact";
    } else if (pathname.includes("/projects/")) {
      currentPage = "projects";
    }
    if (currentPage) {
      const activeLink = document.querySelector(
        `nav a[data-page="${currentPage}"]`,
      );
      if (activeLink) {
        activeLink.classList.add("active");
      }
    }
  }
});
