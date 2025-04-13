# **Tailwind CSS v4 vs. v3: A Guide for Agentic Coding Tools**

## **I. Introduction**

Tailwind CSS v4 represents a significant evolution from version 3, introducing fundamental architectural changes, a reimagined configuration experience, and a suite of new features leveraging modern web platform capabilities. This guide provides a comprehensive overview of the differences between Tailwind CSS v3 and v4, specifically tailored for use by agentic large language model (LLM) coding tools. Understanding these changes is crucial for accurately analyzing, migrating, and generating code for projects using the latest version of the framework. Key areas of transformation include the core engine, build process, configuration methods, utility classes, variants, and recommended development conventions.

## **II. Architectural Overhaul: The Oxide Engine and Unified Toolchain**

Tailwind CSS v4 is built upon a completely rewritten core engine, internally referred to as "Oxide" during development.1 This ground-up rewrite leverages years of experience with the framework to optimize performance and flexibility dramatically.2

* **Performance Enhancements:** The new engine delivers substantial speed improvements. Full project builds are reported to be up to 5x faster 2, with some benchmarks showing up to 10x speedups (e.g., Tailwind CSS website build time reduced from 960ms to 105ms).3 Incremental build performance sees an even more significant boost, potentially over 100x faster, often measured in microseconds for changes not requiring new CSS generation.2 This enhanced speed stems from migrating performance-critical parts to Rust, utilizing a custom CSS parser tailored for Tailwind (over 2x faster than PostCSS parsing), and employing more efficient data structures.1 The engine also leverages multi-core processing for parallel work.5  
* **Unified Toolchain (Lightning CSS Integration):** Unlike v3, which primarily functioned as a PostCSS plugin requiring other tools like autoprefixer and postcss-import, v4 integrates Lightning CSS directly into its core.1 This creates an all-in-one toolchain that handles essential CSS processing tasks out of the box:  
  * **Built-in @import Handling:** Eliminates the need for separate tools like postcss-import.3 Tailwind automatically bundles @imported CSS files.7  
  * **Built-in Vendor Prefixing:** Removes the requirement for autoprefixer.3  
  * **Built-in Nesting Support:** Native handling of CSS nesting syntax without extra plugins.3  
  * **Syntax Transforms:** Automatically transpiles modern CSS features (like oklch() colors, media query ranges) for broader browser compatibility.3  
* **Modern CSS Foundation:** v4 is built using modern CSS features like native cascade layers (@layer), registered custom properties (@property), and color functions (color-mix()), which contribute to better control over styles, improved performance on large pages, and simplified internal framework logic.2

This architectural shift results in a faster, more streamlined development experience with fewer dependencies and less complex build configurations compared to v3.2

## **III. Simplified Installation and Automatic Content Detection**

Reflecting the move towards simplicity and speed, Tailwind v4 significantly streamlines the project setup process compared to v3.

* **Simplified Installation:**  
  * Fewer dependencies are required. The core tailwindcss package is now leaner, and separate packages exist for specific integrations.2  
  * The primary CSS setup involves a single @import statement instead of the multiple @tailwind directives used in v3.2  
    CSS  
    /\* v3 Approach \*/  
    @tailwind base;  
    @tailwind components;  
    @tailwind utilities;

    /\* v4 Approach \*/  
    @import "tailwindcss";

  * Zero configuration is needed to get started; Tailwind v4 works out of the box with default settings without requiring a config file or even content path specification initially.1  
* **Tooling Packages:** The core tailwindcss package in v3 acted as the PostCSS plugin. In v4, specific integration methods use dedicated packages:  
  * **PostCSS:** @tailwindcss/postcss 2  
  * **Vite:** @tailwindcss/vite (Recommended for Vite projects for optimal performance) 2  
  * **CLI:** @tailwindcss/cli 5  
* **Automatic Content Detection:** A major developer experience improvement in v4 is automatic content detection.2  
  * v3 required manually configuring the content array in tailwind.config.js to specify template file paths.  
  * v4 automatically scans the project for potential class names using built-in heuristics.2 It intelligently ignores files/directories listed in .gitignore (like node\_modules), binary files, CSS files, and lock files to optimize scanning speed.2  
  * For Vite plugin users, detection leverages the module graph for maximum accuracy and performance.3  
  * If automatic detection misses necessary files (e.g., external libraries in node\_modules), the @source directive can be used in the CSS file to explicitly include paths.6 The @source not directive can be used to exclude paths.16

This zero-config approach significantly lowers the barrier to entry and reduces boilerplate for new projects.2

## **IV. Configuration: The Shift to CSS-First**

Tailwind v4 introduces a fundamental change in configuration philosophy, moving towards a "CSS-first" approach, aiming to make the framework feel more like native CSS and less like a JavaScript library.1

* **CSS-First Configuration (@theme):**  
  * The primary method for customization in v4 is the @theme directive within your main CSS file.2  
  * Inside @theme, you define design tokens (colors, fonts, spacing, breakpoints, etc.) as standard CSS custom properties (variables).2  
    CSS  
    @import "tailwindcss";

    @theme {  
      /\* Custom font \*/  
      \--font-display: "Satoshi", "sans-serif";

      /\* Custom breakpoint \*/  
      \--breakpoint-3xl: 1920px; /\* Generates 3xl: variant \*/

      /\* Custom color \*/  
      \--color-neon-pink: oklch(71.7% 0.25 360); /\* Generates text-neon-pink, bg-neon-pink etc. \*/

      /\* Custom spacing \*/  
      \--spacing-128: 32rem; /\* Generates p-128, m-128, w-128 etc. \*/  
    }

  * Tailwind automatically generates the corresponding utility classes and variants based on these theme variables.3  
  * These theme variables are also exposed as regular CSS variables (e.g., in :root or via cascade layers), making them directly usable in custom CSS via var().2 This replaces the primary use case of the v3 theme() function.3  
  * Adding new variables within @theme acts like theme.extend in v3.3 To completely replace a default theme namespace (e.g., all default colors), you first clear it using wildcard syntax (--color-\*: initial;) within @theme before defining your custom values.3  
* **Status of tailwind.config.js:**  
  * v4 **no longer automatically detects or requires** a tailwind.config.js file.9 Projects can run entirely without one using defaults or CSS-based configuration.  
  * However, for backward compatibility and easier migration, v4 **still supports** using a JavaScript configuration file.3  
  * To use a JS config file, you must explicitly point to it using the @config directive at the **top** of your main CSS file, before any @import statements.10  
    CSS  
    @config "./tailwind.config.js"; /\* Must be at the top \*/  
    @import "tailwindcss";  
    /\* Other CSS directives like @theme, @plugin etc. can follow \*/

  * The official upgrade tool (@tailwindcss/upgrade) can automatically migrate most tailwind.config.js settings to the new CSS-first format.4  
  * Some v3 JS config options like corePlugins, safelist, and separator are not supported in the v4 CSS configuration model. Features like prefix and important were planned for v4 but might require checking the final stable release documentation.3  
* **Configuration Mapping (v3 JS to v4 CSS):** The following table illustrates how common v3 configuration patterns translate to the v4 CSS-first approach:

| v3 tailwind.config.js Setting | v4 CSS Directive Equivalent | Snippet Evidence | Notes |
| :---- | :---- | :---- | :---- |
| content: \['./src/\*\*/\*.{html,js}'\] | Automatic Detection (Default) or @source "./src/\*\*/\*.{html,js}"; | 2 | Automatic is preferred; use @source for explicit paths or ignored dirs. |
| theme.extend.colors: { newColor: '\#...' } | @theme { \--color-newColor: \#...; } | 2 | Define as CSS variable in @theme. |
| theme.colors: {... } (Override) | @theme { \--color-\*: initial; \--color-name: \#...; /\*... \*/ } | 3 | Clear namespace with initial, then define. |
| darkMode: 'media' | Default behavior (no directive needed) | 3 | v4 defaults to prefers-color-scheme. |
| darkMode: 'class' / darkMode: 'selector' | @custom-variant dark (&:where(.dark,.dark \*)); | 22 | Use @custom-variant to define the selector. |
| darkMode: \['selector', '\[data-mode="dark"\]'\] | @custom-variant dark (&:where(\[data-theme=dark\], \[data-theme=dark\] \*)); | 28 | Adapt selector in @custom-variant. |
| plugins: \[ require('@tailwindcss/typography') \] | @plugin "@tailwindcss/typography"; | 22 | Use @plugin directive. |
| theme.extend.spacing: { '128': '32rem' } | @theme { \--spacing-128: 32rem; } | 20 | Define theme variable. |
| theme.container.center: true | @utility container { margin-inline: auto; /\*... \*/ } | 11 | Customize via @utility. |
| theme.container.padding: '2rem' | @utility container { padding-inline: 2rem; /\*... \*/ } | 11 | Customize via @utility. |
| prefix: 'tw-' | Planned for v4, check final docs. | 3 | Was not in alpha/beta. |
| important: true / important: '\#app' | Planned for v4, check final docs. | 3 | Was not in alpha/beta. |
| separator: '\_' | Not supported in v4 CSS config. |  | JS config option only. |

* **Configuration Location:** The shift to CSS-first configuration centralizes many aspects (theme, plugins, source paths, custom variants) within the CSS file itself. While v3 strictly used tailwind.config.js, v4 offers flexibility. A project might use only CSS configuration, only JS configuration (via @config), or potentially a mix if @config is used alongside other CSS directives. This flexibility means development tools need to be aware that configuration settings might reside in either the main CSS file or a referenced JS file, or potentially be split between them. Ideally, tools generating new v4 projects or configurations should favor the CSS-first approach unless explicitly instructed otherwise or modifying a project already committed to using @config.

## **V. Comparative Analysis: Utilities and Variants (v3 vs. v4)**

Tailwind v4 significantly expands the available utilities and variants, integrates features previously requiring plugins, and refines or removes some v3 constructs.

* **New v4 Utilities:**  
  * **Container Queries:** Built-in support replaces the v3 @tailwindcss/container-queries plugin. Apply the @container class to a parent element, then use size variants like @sm:, @lg: on children to style them based on the parent's width.2  
  * **3D Transforms:** A suite of utilities for 3D manipulation, including rotate-x-\*, rotate-y-\*, rotate-z-\*, translate-z-\*, scale-z-\*, perspective-\*, perspective-origin-\*, and transform-3d.2  
  * **Expanded Gradients:** Enhanced gradient capabilities include radial (bg-radial-\*) and conic (bg-conic-\*) gradients, support for angles in linear gradients (bg-linear-45), and control over color interpolation modes (bg-linear-to-r/oklch, bg-conic/\[in\_hsl\_longer\_hue\]).2  
  * **size-\* Utility:** Introduced in v3.4 but fully embraced and supported by tools like tailwind-merge in the v4 context, size-\* combines width and height (e.g., size-4 replaces w-4 h-4).26  
  * **Text Wrapping:** Utilities for controlling text wrapping, including text-wrap, text-nowrap, text-balance (from v3.4+), and the v4.1 additions wrap-break-word and wrap-anywhere for fine-grained control, especially with long words or within flex containers.16  
  * **text-shadow-\* (v4.1):** Adds text shadow effects with a default scale (text-shadow-2xs to text-shadow-lg) and support for custom colors (text-shadow-indigo-500) and opacity (text-shadow-lg/50).16  
  * **mask-\* (v4.1):** A set of composable utilities for applying masks using images or gradients. Includes properties like mask-image, mask-mode, mask-repeat, mask-position, mask-size, mask-origin, mask-clip, and specific gradient mask utilities like mask-b-from-\*.16  
  * **Colored drop-shadow-\* (v4.1):** Allows specifying the color of drop shadows, including opacity modifiers (e.g., drop-shadow-cyan-500/50).16  
  * **Other Additions:** inset-shadow-\*, inset-ring-\*, field-sizing, color-scheme 32, font-stretch 6, inert.  
* **New v4 Variants:**  
  * **starting::** Leverages the native CSS @starting-style rule, enabling enter/exit transitions (often used with the popover attribute) without requiring JavaScript.2  
  * **not-\*:** Provides access to the CSS :not() pseudo-class for applying styles conditionally when an element *doesn't* match another selector or variant (e.g., not-hover:opacity-75).1  
  * **Composable Variants:** A powerful feature allowing variants to be chained together to create complex selectors, such as group-has-focus:, peer-focus-visible:, or even group-not-has-peer-not-data-active:.1  
  * **Container Query Variants:** @\<size\> variants (e.g., @sm:, @md:, @lg:) used in conjunction with elements marked with the @container class.2  
  * **open:** Styles elements based on their open state, applicable to \<details\>, \<dialog\>, and elements using the popover attribute. Includes support for :popover-open.2  
  * **nth-\*:** Variants corresponding to :nth-child() pseudo-classes.2  
  * **in-\*:** Implicit group variants for simpler group-based styling.2  
  * **Descendant Variant (\*:):** A variant to style all descendant elements.2  
  * **inverted-colors (v4.1):** Targets user operating system settings where an inverted color scheme is active.16  
  * **noscript (v4.1):** Applies styles specifically when JavaScript is disabled in the browser.16  
* **Deprecated/Removed/Altered v3 Utilities & Concepts:**  
  * **Opacity Utilities Removed:** All \*-opacity-\* utilities (bg-opacity-\*, text-opacity-\*, border-opacity-\*, etc.) are removed. The modern CSS color module syntax with an opacity modifier (e.g., bg-black/50, text-red-500/75) is used instead.5  
  * **Flex Grow/Shrink Renamed:** flex-grow-\* is now grow-\*, and flex-shrink-\* is now shrink-\*.5  
  * **Miscellaneous Removals/Renames:** overflow-ellipsis becomes text-ellipsis; decoration-slice becomes box-decoration-slice; decoration-clone becomes box-decoration-clone.5  
  * **Scale Utility Renames:** Several utilities using \-sm or no suffix in v3 have been shifted to accommodate a new \-xs step. This affects shadow, drop-shadow, blur, backdrop-blur, and rounded. For example, v3 shadow-sm is now shadow-xs, and v3 shadow is now shadow-sm. The bare versions (e.g., shadow, blur, rounded) are maintained for backward compatibility but now map to the new \-sm value, meaning their visual appearance might change if not updated.11  
  * **outline-none Renamed:** Changed to outline-hidden for better semantic clarity.11  
  * **ring Default Altered:** The default ring utility (without a width specified) now corresponds to ring-3 in v4.11 Check specific documentation for the exact pixel value change if critical.  
  * **space-x-\*/space-y-\* Behavior Change:** This is a significant change driven by performance concerns on large pages. The v3 selector \> :not(\[hidden\]) \~ :not(\[hidden\]) applied margin-top (or margin-left) to subsequent siblings. The v4 selector \> :not(:last-child) applies margin-bottom (or margin-right) to all direct children except the last one. This changes the CSS property used and the elements targeted, potentially affecting layout and requiring adjustments.11  
  * **Gradient Variant Behavior Change:** In v3, applying a variant to one part of a multi-stop gradient (e.g., dark:from-blue-500 on a from-red-500 via-green-500 to-yellow-500 gradient) could implicitly reset other stops (like via and to). In v4, variant applications preserve other stops unless they are also explicitly overridden by the variant. This might necessitate adding classes like dark:via-none or dark:to-transparent if the v3 resetting behavior was desired.11  
  * **Default Value Changes:**  
    * Default border color (border-\*) and divide color (divide-\*) changed from gray-200 in v3 to currentColor in v4. This requires explicitly setting a border/divide color where one was previously implicit.11  
    * Default placeholder color has been updated.11  
    * Buttons (\<button\>) no longer have cursor-pointer applied by default.11  
    * Default margins on \<dialog\> elements have been removed.11  
* **Table: v3 to v4 Utility/Concept Status Mapping:**

| v3 Utility/Concept | v4 Status | v4 Equivalent/Notes | Snippet Evidence |
| :---- | :---- | :---- | :---- |
| @tailwind base; | Removed | Use @import "tailwindcss"; | 10 |
| @tailwind components; | Removed | Use @import "tailwindcss"; | 10 |
| @tailwind utilities; | Removed | Use @import "tailwindcss"; | 10 |
| bg-opacity-\* | Removed | Use opacity modifier: bg-color/opacity (e.g., bg-black/50) | 5 |
| text-opacity-\* | Removed | Use opacity modifier: text-color/opacity | 5 |
| border-opacity-\* | Removed | Use opacity modifier: border-color/opacity | 5 |
| flex-grow-\* | Removed | Use grow-\* | 5 |
| flex-shrink-\* | Removed | Use shrink-\* | 5 |
| shadow-sm | Renamed | shadow-xs | 11 |
| shadow | Renamed | shadow-sm (Bare shadow still works for compat, maps to shadow-sm) | 11 |
| blur-sm | Renamed | blur-xs | 11 |
| blur | Renamed | blur-sm (Bare blur still works for compat, maps to blur-sm) | 11 |
| rounded-sm | Renamed | rounded-xs | 11 |
| rounded | Renamed | rounded-sm (Bare rounded still works for compat, maps to rounded-sm) | 11 |
| outline-none | Renamed | outline-hidden | 11 |
| ring | Altered Default | Default ring utility now equals ring-3 | 11 |
| space-x-\* / space-y-\* | Behavior Changed | Uses margin-bottom on :not(:last-child) instead of margin-top on subsequent siblings. Affects layout/selectors. | 11 |
| Gradient Variants (e.g., dark:from-color) | Behavior Changed | Variants preserve other stops; may need explicit dark:via-none to unset. | 11 |
| Default Border/Divide Color | Behavior Changed | currentColor instead of gray-200. Requires explicit color. | 11 |
| @tailwindcss/container-queries (Plugin) | Replaced | Built-in via @container class and @\<size\>: variants. | 2 |
| theme() function | Deprecated (for new projects) | Use var(--theme-variable) instead. Supported for backward compatibility. | 3 |

* **Increased Expressiveness vs. Potential Complexity:** The addition of numerous new utilities and especially composable variants 3 significantly enhances Tailwind's expressive power, allowing more complex styling directly within HTML markup.2 This reduces reliance on custom CSS or JavaScript for intricate conditional styling. However, this power comes with the potential for increased complexity. Overuse of deeply nested or numerous combined variants (e.g., lg:dark:motion-safe:group-hover:peer-focus:invalid:not-disabled:text-red-500/75) can lead to class strings that are difficult to read, maintain, and debug.14 Tools and developers need to balance leveraging the new capabilities with maintaining code clarity. The expanded vocabulary of utilities also requires learning more specific class names.16

## **VI. Deep Dive into Key v4 Features and Concepts**

Several core Tailwind concepts see significant changes in implementation methodology in v4, primarily driven by the CSS-first approach.

* **Dark Mode Implementation:**  
  * **Default (Media Query):** Like v3's darkMode: 'media' setting 27, v4 defaults to using the prefers-color-scheme CSS media query. Styles are applied using the dark: variant prefix when the user's OS is set to dark mode.28 No explicit configuration is needed for this default behavior.  
  * **Manual Toggle (Selector Strategy):** In v3, enabling manual toggling (e.g., via a button) required setting darkMode: 'class' or darkMode: 'selector' in tailwind.config.js.29 In v4, this is achieved by defining a custom dark variant using the @custom-variant directive in the CSS file.22  
    * To use a class (e.g., .dark on the \<html\> tag):  
      CSS  
      @import "tailwindcss";  
      @custom-variant dark (&:where(.dark,.dark \*));  
      22 The :where() pseudo-class ensures the selector maintains low specificity, consistent with other utilities.  
    * To use a data attribute (e.g., data-theme="dark"):  
      CSS  
      @import "tailwindcss";  
      @custom-variant dark (&:where(\[data-theme=dark\], \[data-theme=dark\] \*));  
      28  
  * **Supporting System Preference and Manual Selection:** The JavaScript logic used to manage the toggle (reading/writing localStorage, checking window.matchMedia('(prefers-color-scheme: dark)'), and adding/removing the class or attribute on the \<html\> element) remains largely the same conceptually when using the selector strategy in either v3 or v4.28  
* **Plugin Integration:**  
  * **v4 Method:** Plugins are registered directly within the CSS file using the @plugin directive, specifying the package name or path.22  
    CSS  
    @import "tailwindcss";  
    @plugin "@tailwindcss/typography";  
    @plugin "@tailwindcss/forms";  
    /\* @plugin "./path/to/local/plugin.js"; \*/

  * **v3 Method:** Plugins were added to the plugins array in tailwind.config.js, typically using require().22  
  * **Plugin API:** While the registration method has changed, the underlying API functions provided to plugin authors (like addUtilities, matchUtilities, addComponents, addBase, addVariant, matchVariant, theme, config, corePlugins) appear conceptually similar, allowing plugins to hook into Tailwind's system to add styles and variants.30 The context in which these functions operate is now tied to the CSS-based configuration system.  
* **Theme Value Access in CSS:**  
  * **v4 Primary Method (var()):** With the CSS-first approach, theme tokens defined in @theme are exposed as standard CSS variables. The recommended way to access these values in custom CSS (e.g., within @layer base, @layer components, or @utility) is using the native CSS var() function.2  
    CSS  
    @layer components {  
     .btn-primary {  
        background-color: var(--color-blue-500); /\* Accessing theme color \*/  
        padding: var(--spacing-4); /\* Accessing theme spacing \*/  
      }  
    }

  * **v3 Method (theme()):** v3 provided a build-time theme() function to access values from tailwind.config.js within CSS.27  
    CSS  
    /\* v3 Example \*/

  .btn-primary {background-color: theme('colors.blue.500');padding: theme('spacing.4');}\`\`\`

  * **v4 theme() Compatibility:** While var() is preferred for new v4 projects, the theme() function is planned to be supported in v4 for backward compatibility, easing migration.3  
  * **Opacity Adjustment:** To adjust the opacity of a theme color variable in v4 CSS, use the \--alpha() function: color: \--alpha(var(--color-lime-300) / 50%);.19 This replaces v3's syntax like theme('colors.blue.500 / 75%').33  
* **Unification in CSS:** These changes demonstrate a clear pattern in v4: configuration logic previously handled in JavaScript is moving directly into the CSS file. Defining the dark mode strategy (@custom-variant), registering plugins (@plugin), and defining theme tokens (@theme) all happen within the CSS context. Accessing these tokens also shifts from a build-time function (theme()) to standard runtime CSS variables (var()). This creates a more self-contained and CSS-native environment where the rules governing Tailwind's behavior and the design primitives it uses reside alongside the custom styles being written. LLMs generating or analyzing v4 code must recognize CSS as the primary location for these configuration aspects, not just style application.

## **VII. Migration Strategy: Updating Projects from v3 to v4**

Migrating a project from Tailwind CSS v3 to v4 involves several steps due to the significant changes introduced. While an official tool assists the process, understanding the manual steps and breaking changes is crucial.

* **Official Upgrade Tool (@tailwindcss/upgrade):**  
  * Tailwind provides a command-line tool, typically invoked as npx @tailwindcss/upgrade@next (during pre-release phases) or npx @tailwindcss/upgrade (post-release), designed to automate much of the migration.4  
  * **Functionality:** The tool handles:  
    * Updating dependencies in package.json to v4 versions and correct tooling packages (@tailwindcss/postcss, etc.).  
    * Migrating tailwind.config.js settings to the equivalent CSS directives (@theme, @plugin, @custom-variant, etc.) in the main CSS file.  
    * Replacing @tailwind directives with @import "tailwindcss";.  
    * Finding and replacing renamed/removed utility classes in template files (HTML, JS, Vue, etc.).  
    * Updating PostCSS configuration files. 4  
  * **Prerequisites:** Requires Node.js version 20 or higher.6  
  * **Recommendations:** It is strongly recommended to run the upgrade tool on a separate Git branch. After running, developers should carefully review the generated code changes (diff) and thoroughly test the application visually and functionally across different browsers and states.6 The tool may not be able to automatically migrate everything, especially complex custom configurations (like functions within the theme object in JS config) or non-standard project structures, requiring manual intervention.24  
* **Manual Migration Steps:** If the tool cannot be used, or for verification purposes, the following manual steps are necessary:  
  * **Update Dependencies:** Uninstall v3 tailwindcss. Install the v4 tailwindcss core package and the appropriate integration package (@tailwindcss/postcss, @tailwindcss/vite, or @tailwindcss/cli). Update postcss to v8 if not already using it. Remove autoprefixer and postcss-import as they are now built-in.5  
  * **Build Tool Configuration:**  
    * **PostCSS:** Modify postcss.config.js (or .mjs) to replace tailwindcss in the plugins array with @tailwindcss/postcss. Remove autoprefixer and postcss-import plugins.11  
    * **Vite:** Modify vite.config.js (or .ts) to import and use the @tailwindcss/vite plugin.11  
    * **CLI:** Update build scripts in package.json to use npx @tailwindcss/cli instead of npx tailwindcss.11  
  * **CSS Entry Point:** In the main CSS file (e.g., app.css, global.css), remove the @tailwind base;, @tailwind components;, and @tailwind utilities; directives. Replace them with a single @import "tailwindcss";.10  
  * **Configuration Migration:** Manually translate settings from tailwind.config.js into the corresponding v4 CSS directives (@theme, @source, @plugin, @custom-variant, @utility). Alternatively, keep the tailwind.config.js file and add @config './tailwind.config.js'; at the very top of the CSS entry point.11 Remember that not all JS config options have direct CSS equivalents.  
  * **Template File Updates:** Search project templates (HTML, JSX, Vue, Svelte, etc.) for:  
    * Renamed utilities (e.g., replace shadow with shadow-sm, blur with blur-sm, rounded with rounded-sm, shadow-sm with shadow-xs, etc.).5  
    * Removed utilities (e.g., replace bg-opacity-50 with /50 modifier like bg-blue-500/50).5  
    * Classes affected by behavioral changes (review elements using space-x-\*/space-y-\*, complex gradients with variants, elements relying on default border/divide/placeholder colors).11  
* **Critical Breaking Changes Summary:**  
  * **Browser Support:** v4 mandates modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+). It relies on features like @property and color-mix() and **will not function correctly** in older browsers. While v4.1 introduced fallbacks for better rendering degradation, perfect compatibility is not guaranteed.11 Projects needing legacy browser support should remain on v3.4.  
  * **Configuration Model:** The shift to CSS-first is the default and recommended path. Relying solely on the v3-style tailwind.config.js requires the explicit @config directive.3  
  * **CSS Directives:** The removal of @tailwind directives in favor of @import "tailwindcss"; is a mandatory change.11  
  * **Utility Naming & Availability:** Numerous utilities are renamed or removed entirely (especially opacity utilities). Code relying on old names will break.11  
  * **Behavioral Changes:** Alterations to space-\* selectors, gradient variant merging logic, and default colors (currentColor for borders/divides) can lead to subtle but significant visual differences if not accounted for.11  
* **Common Migration Issues:** Developers might encounter problems such as:  
  * Third-party libraries or tools (like older versions of Shadcn UI's CLI) that specifically expect a tailwind.config.js file might fail or require workarounds if using the pure CSS-first approach.22  
  * Build process errors if dependencies or build tool configurations (PostCSS, Vite) are not updated correctly.23  
  * Incomplete or incorrect migrations by the automated tool, particularly with non-standard configurations or complex template logic.24  
* **Migration Complexity:** The migration from v3 to v4 is more involved than previous major version upgrades due to the fundamental architectural and configuration changes. While the upgrade tool 11 is powerful and highly recommended, the scope of breaking changes 11 means manual review and testing are indispensable.6 Developers need to understand not just the syntax changes but also the behavioral shifts (like space-\* 11) and the new configuration paradigm 13 to ensure a successful migration. LLMs assisting with migration should emphasize the tool but also provide guidance on manual steps and verification.

## **VIII. v4 Conventions and Best Practices for Code Generation**

For an LLM coding tool generating Tailwind v4 code, adhering to the new conventions and best practices is essential for producing idiomatic, efficient, and maintainable results.

* **Embrace CSS-First Configuration:** Generate project setups and customizations using the CSS directives (@theme, @source, @plugin, @custom-variant, @utility) within the main CSS file by default. Avoid generating or relying on tailwind.config.js unless explicitly requested by the user or when modifying a project that already uses the @config directive.  
* **Leverage CSS Variables for Theme Access:** When generating custom CSS (e.g., for components in @layer components or custom utilities via @utility), use the standard CSS var() function (e.g., var(--color-primary-500), var(--spacing-6)) to access theme values. Avoid using the legacy theme() function, although it exists for backward compatibility.2 Use the \--alpha() function for opacity adjustments with variables.19  
* **Utilize Modern v4 Features:** Generate code that takes advantage of v4's new capabilities when semantically appropriate:  
  * Use container queries (@container class on parent, @\<size\>: variants on children) for element-based responsive design.2  
  * Employ composable variants (group-has-\*, peer-focus:, not-\*) for complex conditional styling directly in HTML.1  
  * Use the starting: variant for CSS-driven enter/exit transitions, especially with popovers.2  
  * Apply new utilities like mask-\*, text-shadow-\* (v4.1+), 3D transforms, expanded gradients, size-\*, and text wrapping utilities where suitable.2  
* **Maintain Utility-First Philosophy:** Continue prioritizing the composition of utility classes in the markup. Use @apply judiciously, primarily for extracting highly repetitive utility patterns into component classes or for overriding styles in third-party libraries where direct markup modification is not feasible.19 For creating new, reusable, variant-aware utility abstractions, prefer the @utility directive.11  
* **Promote Readable Class Strings:** While composable variants offer great power, guide towards generating class combinations that remain reasonably readable and maintainable. For extremely long or convoluted conditional logic, consider suggesting component extraction (in JS frameworks) or defining a custom utility/component class using @utility or @layer components with @apply.  
* **Enforce Static Class Names:** Strongly reinforce the critical requirement (present in v3 and v4) that class names must exist as complete, static strings within the template files for Tailwind's detection mechanism to work. Avoid dynamic string concatenation or interpolation to build class names. Generate code that maps dynamic application state or props to full, static class names.18  
  JavaScript  
  // Bad: Dynamic concatenation \- Tailwind won't see these classes  
  // function BadButton({ color, intensity }) {  
  //   return \<button className={\`bg-\<span class="math-inline"\>\\{color\\}\\-\</span\>{intensity} text-white\`}\>Click\</button\>;  
  // }

  // Good: Mapping props to static class names  
  function GoodButton({ color, intensity }) {  
    const intensityMap \= { low: '500', high: '700' };  
    const colorMap \= {  
      blue: \`bg-blue-${intensityMap\[intensity\]} text-white\`,  
      red: \`bg-red-${intensityMap\[intensity\]} text-white\`,  
    };  
    return \<button className={\`${colorMap\[color\]} px-4 py-2 rounded\`}\>Click\</button\>;  
  }

* **Browser Compatibility Context:** Generate code assuming the modern browser baseline required by v4 (Safari 16.4+, Chrome 111+, Firefox 128+).11 If the user expresses a need for broader compatibility, explicitly state that v4 may not be suitable, or mention that v4.1+ includes fallbacks that improve rendering in older browsers but may not provide identical results.16  
* **Correct Tooling Integration:** When generating setup instructions or build scripts, use the correct v4 package names and commands for the specified build tool: @tailwindcss/vite for Vite, @tailwindcss/postcss for PostCSS-based frameworks (like Next.js, Angular), and @tailwindcss/cli for the standalone CLI.11  
* **Shift Towards Native CSS Practices:** The conventions emerging in v4 guide development towards patterns that align more closely with modern, standard CSS. Using CSS variables (var()) directly 2, leveraging variants that map closely to native CSS pseudo-classes or features (starting:, not-\*) 2, and managing configuration within CSS itself 2 all encourage a deeper engagement with the underlying platform capabilities. LLMs generating v4 code should reflect this shift, favoring these native-aligned approaches over v3's more abstracted, build-time-heavy mechanisms. Understanding the connection between a v4 feature (like @custom-variant dark) and the resulting CSS selector strategy allows for more accurate and idiomatic code generation.

## **IX. Conclusion: Key Takeaways for LLM Tooling**

Tailwind CSS v4 marks a substantial leap from v3, demanding adaptation from developers and the tools that assist them. For an agentic LLM coding tool to effectively work with v4, it must internalize the following critical differentiators:

1. **Configuration Paradigm Shift:** The move from v3's JavaScript-centric tailwind.config.js to v4's CSS-first approach using directives like @theme, @plugin, and @custom-variant is the most fundamental change. LLMs must look for and generate configuration primarily within CSS files, while recognizing the optional @config directive for JS file usage.  
2. **Engine and Tooling:** v4 integrates a high-performance engine (Oxide/Lightning CSS), simplifying setup by including import handling, prefixing, and nesting. Tooling is now provided via specific packages (@tailwindcss/postcss, @tailwindcss/vite, @tailwindcss/cli).  
3. **Syntax and Utility Changes:** The replacement of @tailwind directives with @import "tailwindcss"; is mandatory. Numerous utility classes have been renamed (e.g., shadow, blur, rounded scales), removed (opacity utilities), or had their behavior altered (space-\*, gradients, defaults). The opacity modifier syntax (/50) is now standard. LLMs need to perform accurate translation between v3 and v4 syntax.  
4. **Expanded Feature Set:** v4 introduces powerful new features natively, including container queries, composable variants, 3D transforms, advanced gradients, the starting: variant for transitions, masking (v4.1), text shadows (v4.1), and more. LLMs should leverage these features when generating v4 code.  
5. **Modern Browser Requirement:** v4's reliance on modern CSS features dictates stricter browser support (Safari 16.4+, Chrome 111+, Firefox 128+). This constraint must be considered in project suitability and code generation.  
6. **Migration Path:** While the @tailwindcss/upgrade tool is the recommended starting point for migrating v3 projects, the significant breaking changes necessitate careful review and likely manual adjustments. LLMs should guide users accordingly.

In essence, Tailwind CSS v4 is not just an update but a re-architecture focused on performance, modern CSS alignment, and a streamlined developer experience centered around CSS itself. Accurate and effective LLM assistance requires a deep understanding of this new paradigm, moving beyond v3 patterns to fully embrace the capabilities and conventions of Tailwind CSS v4.

#### **Works cited**

1. Tailwind CSS v4.0 Alpha: A Revolution Unveiled \- DEV Community, accessed on April 13, 2025, [https://dev.to/mitchiemt11/tailwind-css-v40-alpha-a-revolution-unveiled-3g72](https://dev.to/mitchiemt11/tailwind-css-v40-alpha-a-revolution-unveiled-3g72)  
2. Tailwind CSS v4.0 \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)  
3. Open-sourcing our progress on Tailwind CSS v4.0 \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/blog/tailwindcss-v4-alpha](https://tailwindcss.com/blog/tailwindcss-v4-alpha)  
4. Tailwind CSS v4 is Here \- Laravel News, accessed on April 13, 2025, [https://laravel-news.com/tailwind-css-v4-is-now-released](https://laravel-news.com/tailwind-css-v4-is-now-released)  
5. Tailwind CSS 4.0: Everything you need to know in one place \- Daily.dev, accessed on April 13, 2025, [https://daily.dev/blog/tailwind-css-40-everything-you-need-to-know-in-one-place](https://daily.dev/blog/tailwind-css-40-everything-you-need-to-know-in-one-place)  
6. Tailwind CSS v4.0 Beta, accessed on April 13, 2025, [https://v3.tailwindcss.com/docs/v4-beta](https://v3.tailwindcss.com/docs/v4-beta)  
7. Compatibility \- Getting started \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/compatibility](https://tailwindcss.com/docs/compatibility)  
8. Tailwind CSS \- Rapidly build modern websites without ever leaving your HTML., accessed on April 13, 2025, [https://tailwindcss.com/](https://tailwindcss.com/)  
9. Tailwind CSS v4.0: Everything You Need to Know \- MojoAuth \- Go Passwordless, accessed on April 13, 2025, [https://mojoauth.com/blog/tailwind-css-v4-0-everything-you-need-to-know/](https://mojoauth.com/blog/tailwind-css-v4-0-everything-you-need-to-know/)  
10. Tailwind v4 | HeroUI (Previously NextUI) \- Beautiful, fast and modern React UI Library, accessed on April 13, 2025, [https://www.heroui.com/docs/guide/tailwind-v4](https://www.heroui.com/docs/guide/tailwind-v4)  
11. Upgrade guide \- Getting started \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)  
12. How to upgrade TailwindCSS? \- Stack Overflow, accessed on April 13, 2025, [https://stackoverflow.com/questions/79380519/how-to-upgrade-tailwindcss](https://stackoverflow.com/questions/79380519/how-to-upgrade-tailwindcss)  
13. \[v4\] Docs on tailwind.config.js and @config · tailwindlabs tailwindcss · Discussion \#16803, accessed on April 13, 2025, [https://github.com/tailwindlabs/tailwindcss/discussions/16803](https://github.com/tailwindlabs/tailwindcss/discussions/16803)  
14. Tailwind CSS v4: Quick Guide \- DEV Community, accessed on April 13, 2025, [https://dev.to/utkarshthedev/tailwind-css-v40-quick-guide-2bh5](https://dev.to/utkarshthedev/tailwind-css-v40-quick-guide-2bh5)  
15. Installing Tailwind CSS with PostCSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/installation/using-postcss](https://tailwindcss.com/docs/installation/using-postcss)  
16. Tailwind CSS v4.1: Text shadows, masks, and tons more \- Tailwind ..., accessed on April 13, 2025, [https://tailwindcss.com/blog/tailwindcss-v4-1](https://tailwindcss.com/blog/tailwindcss-v4-1)  
17. Installing Tailwind CSS with Vite, accessed on April 13, 2025, [https://tailwindcss.com/docs](https://tailwindcss.com/docs)  
18. Detecting classes in source files \- Core concepts \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/detecting-classes-in-source-files](https://tailwindcss.com/docs/detecting-classes-in-source-files)  
19. Functions and directives \- Core concepts \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/functions-and-directives](https://tailwindcss.com/docs/functions-and-directives)  
20. Theme variables \- Core concepts \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme)  
21. Colors \- Core concepts \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/customizing-colors](https://tailwindcss.com/docs/customizing-colors)  
22. TailwindCSS v4.0: Upgrading from v3 with some plugins \- DEV Community, accessed on April 13, 2025, [https://dev.to/sirneij/tailwindcss-v40-upgrading-from-v3-with-some-plugins-572f](https://dev.to/sirneij/tailwindcss-v40-upgrading-from-v3-with-some-plugins-572f)  
23. Tailwind v4 CRA Installation : r/tailwindcss \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/tailwindcss/comments/1j8qcf3/tailwind\_v4\_cra\_installation/](https://www.reddit.com/r/tailwindcss/comments/1j8qcf3/tailwind_v4_cra_installation/)  
24. Migration from V3 to V4 \- still need tailwind.config.js · tailwindlabs tailwindcss · Discussion \#16642 \- GitHub, accessed on April 13, 2025, [https://github.com/tailwindlabs/tailwindcss/discussions/16642](https://github.com/tailwindlabs/tailwindcss/discussions/16642)  
25. Upgrading from v3 to v4 : r/tailwindcss \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/tailwindcss/comments/1icx7f9/upgrading\_from\_v3\_to\_v4/](https://www.reddit.com/r/tailwindcss/comments/1icx7f9/upgrading_from_v3_to_v4/)  
26. Tailwind v4 \- Shadcn UI, accessed on April 13, 2025, [https://ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)  
27. Upgrade Guide \- Tailwind CSS, accessed on April 13, 2025, [https://v3.tailwindcss.com/docs/upgrade-guide](https://v3.tailwindcss.com/docs/upgrade-guide)  
28. Dark mode \- Core concepts \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode)  
29. Dark Mode \- Tailwind CSS, accessed on April 13, 2025, [https://v3.tailwindcss.com/docs/dark-mode](https://v3.tailwindcss.com/docs/dark-mode)  
30. Plugins \- Tailwind CSS, accessed on April 13, 2025, [https://v3.tailwindcss.com/docs/plugins](https://v3.tailwindcss.com/docs/plugins)  
31. Latest updates \- Blog \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/blog](https://tailwindcss.com/blog)  
32. color-scheme \- Interactivity \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/color-scheme](https://tailwindcss.com/docs/color-scheme)  
33. Functions & Directives \- Tailwind CSS, accessed on April 13, 2025, [https://v3.tailwindcss.com/docs/functions-and-directives](https://v3.tailwindcss.com/docs/functions-and-directives)  
34. Functions & Directives \- Tailwind CSS, accessed on April 13, 2025, [https://v2.tailwindcss.com/docs/functions-and-directives](https://v2.tailwindcss.com/docs/functions-and-directives)  
35. Styling with utility classes \- Core concepts \- Tailwind CSS, accessed on April 13, 2025, [https://tailwindcss.com/docs/styling-with-utility-classes](https://tailwindcss.com/docs/styling-with-utility-classes)  
36. Dark Mode \- Tailwind CSS, accessed on April 13, 2025, [https://v2.tailwindcss.com/docs/dark-mode](https://v2.tailwindcss.com/docs/dark-mode)  
37. Plugins \- Tailwind CSS, accessed on April 13, 2025, [https://v2.tailwindcss.com/docs/plugins](https://v2.tailwindcss.com/docs/plugins)  
38. Configuration \- Tailwind CSS, accessed on April 13, 2025, [https://v3.tailwindcss.com/docs/configuration](https://v3.tailwindcss.com/docs/configuration)  
39. A Complete Guide to Installing Tailwind CSS 4 in Backend Frameworks \- Reddit, accessed on April 13, 2025, [https://www.reddit.com/r/tailwindcss/comments/1ittpy3/a\_complete\_guide\_to\_installing\_tailwind\_css\_4\_in/](https://www.reddit.com/r/tailwindcss/comments/1ittpy3/a_complete_guide_to_installing_tailwind_css_4_in/)