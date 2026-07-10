'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (options: Record<string, unknown>, containerId: string) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

// Keep in sync with the `code` values in language-switcher.tsx.
const INCLUDED_LANGUAGES = 'th,zh-CN,zh-TW,id,ms,tl,vi,ja,ko,hi,ta,es,fr,de,pt,ar';

export function GoogleTranslateWidget() {
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;

    // Google Translate rewrites text nodes in place, which can conflict with
    // React's own DOM diffing on navigation — React sometimes tries to
    // remove/insert a node that Google has already restructured, throwing
    // "Failed to execute 'removeChild'/'insertBefore' on 'Node'". Make both
    // a no-op when the node isn't actually where React expects it.
    const nodeProto = Node.prototype as unknown as {
      __ptpPatchedForTranslate?: boolean;
      removeChild<T extends Node>(child: T): T;
      insertBefore<T extends Node>(newNode: T, referenceNode: Node | null): T;
    };
    if (!nodeProto.__ptpPatchedForTranslate) {
      const originalRemoveChild = nodeProto.removeChild;
      nodeProto.removeChild = function <T extends Node>(this: Node, child: T): T {
        if (child.parentNode !== this) return child;
        return originalRemoveChild.call(this, child);
      };
      const originalInsertBefore = nodeProto.insertBefore;
      nodeProto.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
        if (referenceNode && referenceNode.parentNode !== this) return newNode;
        return originalInsertBefore.call(this, newNode, referenceNode);
      };
      nodeProto.__ptpPatchedForTranslate = true;
    }

    window.googleTranslateElementInit = () => {
      new window.google!.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: INCLUDED_LANGUAGES,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{ position: 'absolute', top: '-9999px', left: '-9999px', height: 0, overflow: 'hidden' }}
    />
  );
}
