import glob, re

new_css = """/* Page Transition Animations */
        html, body {
            overflow-x: hidden;
            background-color: #0b0b0b;
        }
        body {
            visibility: hidden;
            opacity: 0;
            transform: translateX(100vw);
            transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        body.loaded {
            visibility: visible;
            opacity: 1;
            transform: translateX(0);
        }

        body.exiting {
            opacity: 0;
            transform: translateX(-100vw);
            transition: opacity 0.5s ease-in, transform 0.5s cubic-bezier(0.64, 0, 0.78, 0);
            pointer-events: none;
        }

        /* --- STAGGERED COMPONENT SLIDE --- */
        body header,
        body main > *,
        body footer,
        body .grid > a {
            opacity: 0;
            transform: translateX(100vw);
            transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        body.loaded header,
        body.loaded main > *,
        body.loaded footer,
        body.loaded .grid > a {
            opacity: 1;
            transform: translateX(0);
        }

        /* Entrance Delays */
        body.loaded header { transition-delay: 0.05s; }
        body.loaded main > *:nth-child(1) { transition-delay: 0.10s; }
        body.loaded main > *:nth-child(2) { transition-delay: 0.15s; }
        body.loaded main > *:nth-child(3) { transition-delay: 0.20s; }
        body.loaded main > *:nth-child(4) { transition-delay: 0.25s; }
        body.loaded footer { transition-delay: 0.30s; }

        /* Poster Grid Cascading Delays */
        body.loaded .grid > a:nth-child(1) { transition-delay: 0.10s; }
        body.loaded .grid > a:nth-child(2) { transition-delay: 0.15s; }
        body.loaded .grid > a:nth-child(3) { transition-delay: 0.20s; }
        body.loaded .grid > a:nth-child(4) { transition-delay: 0.25s; }
        body.loaded .grid > a:nth-child(5) { transition-delay: 0.30s; }
        body.loaded .grid > a:nth-child(6) { transition-delay: 0.35s; }
        body.loaded .grid > a:nth-child(7) { transition-delay: 0.40s; }
        body.loaded .grid > a:nth-child(8) { transition-delay: 0.45s; }
        body.loaded .grid > a:nth-child(9) { transition-delay: 0.50s; }
        body.loaded .grid > a:nth-child(10) { transition-delay: 0.55s; }
        body.loaded .grid > a:nth-child(n+11) { transition-delay: 0.60s; }

        body.exiting header,
        body.exiting main > *,
        body.exiting footer,
        body.exiting .grid > a {
            opacity: 0;
            transform: translateX(-100vw);
            transition: opacity 0.4s ease-in, transform 0.4s ease-in;
            transition-delay: 0s !important;
        }

        /* --- BACKWARD NAVIGATION --- */
        html.nav-back body {
            opacity: 0;
            transform: translateX(-100vw);
        }
        html.nav-back body header,
        html.nav-back body main > *,
        html.nav-back body footer,
        html.nav-back body .grid > a {
            transform: translateX(-100vw);
        }

        html.nav-back body.loaded {
            opacity: 1;
            transform: translateX(0);
        }
        html.nav-back body.loaded header,
        html.nav-back body.loaded main > *,
        html.nav-back body.loaded footer,
        html.nav-back body.loaded .grid > a {
            transform: translateX(0);
        }

        body.exiting-back {
            opacity: 0;
            transform: translateX(100vw);
            transition: opacity 0.5s ease-in, transform 0.5s cubic-bezier(0.64, 0, 0.78, 0);
            pointer-events: none;
        }

        body.exiting-back header,
        body.exiting-back main > *,
        body.exiting-back footer,
        body.exiting-back .grid > a {
            opacity: 0;
            transform: translateX(100vw);
            transition: opacity 0.4s ease-in, transform 0.4s ease-in;
            transition-delay: 0s !important;
        }"""

for file in glob.glob("*.html"):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # re search starting with "/* Page Transition Animations */" and ending with "</style>"
    pattern = r"\/\* Page Transition Animations \*\/(.*?)(?=\s*<\/style>)"
    new_content = re.sub(pattern, new_css, content, flags=re.DOTALL)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)
        print(f"Patched {file}")

with open("router.js", "r", encoding="utf-8") as f:
    rcontent = f.read()

rcontent = rcontent.replace("setTimeout(resolve, 1000)", "setTimeout(resolve, 450)") # Set to 450 so it feels snappier, the timeout represents exit delay

with open("router.js", "w", encoding="utf-8") as f:
    f.write(rcontent)
print("Patched router.js")
