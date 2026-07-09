import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'

import { colors, typography } from '@theme'

const TypedWebView = WebView as unknown as React.ComponentType<any>

export type WebMarkdownFormatCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'indent'
  | 'alignCenter'
  | 'orderedList'
  | 'unorderedList'
  | 'quote'

export type WebMarkdownEditorHandle = {
  focus: () => void
  insertImages: (uris: string[]) => void
  insertText: (text: string) => void
  insertDivider: () => void
  applyFormat: (command: WebMarkdownFormatCommand) => void
  setMarkdown: (markdown: string) => void
}

type WebMarkdownEditorProps = {
  markdown: string
  placeholder?: string
  onChangeMarkdown: (markdown: string) => void
  onChangePlainText?: (plainText: string) => void
  onImagePress?: (uri: string) => void
}

type EditorMessage =
  | { type: 'ready'; markdown: string; text: string }
  | { type: 'change'; markdown: string; text: string }
  | { type: 'imagePress'; uri: string }

const escapeForHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const createEditorHtml = (initialMarkdown: string, placeholder: string) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    :root {
      color-scheme: light;
      --text: ${colors.semantic.text.primary};
      --muted: ${colors.semantic.text.tertiary};
      --brand: ${colors.brand.primary};
      --subtle: ${colors.semantic.bg.subtle};
      --quote: ${colors.semantic.border.default};
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background: transparent;
      overflow-x: hidden;
      -webkit-text-size-adjust: 100%;
    }
    body {
      font-family: ${JSON.stringify(typography.bodyM.fontFamily)}, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: ${typography.bodyM.fontSize}px;
      line-height: ${typography.bodyM.lineHeight}px;
      color: var(--text);
    }
    #editor {
      min-height: 100vh;
      box-sizing: border-box;
      padding: 4px 0 24px;
      outline: none;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
      caret-color: var(--brand);
      -webkit-user-select: text;
      user-select: text;
    }
    #editor:empty::before {
      content: attr(data-placeholder);
      color: var(--muted);
      pointer-events: none;
    }
    p {
      min-height: ${typography.bodyM.lineHeight}px;
      margin: 0;
      padding: 0;
    }
    b, strong { font-weight: 700; }
    i, em { font-style: italic; }
    u { text-decoration: underline; }
    s, strike { text-decoration: line-through; }
    a { color: var(--brand); text-decoration: underline; }
    blockquote {
      margin: 0;
      padding: 0 0 0 11px;
      border-left: 3px solid var(--quote);
      color: var(--text);
    }
    ul, ol {
      margin: 0;
      padding-left: 30px;
    }
    li { margin: 0; padding: 0; }
    hr {
      height: 1px;
      border: 0;
      background: var(--quote);
      margin: ${(typography.bodyM.lineHeight - 1) / 2}px 0;
    }
    figure[data-editor-image] {
      margin: 4px 0;
      padding: 0;
      width: 100%;
      min-height: 168px;
      border-radius: 0;
      background: var(--subtle);
      overflow: hidden;
      -webkit-user-select: none;
      user-select: none;
    }
    figure[data-editor-image] img {
      display: block;
      width: 100%;
      height: 168px;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div id="editor" contenteditable="true" spellcheck="false" autocapitalize="sentences" data-placeholder="${escapeForHtml(
    placeholder,
  )}"></div>
  <script>
    (function () {
      var editor = document.getElementById('editor');
      var initialMarkdown = ${JSON.stringify(initialMarkdown)};
      var isApplyingExternalValue = false;
      var lastMarkdown = '';

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function escapeAttribute(value) {
        return escapeHtml(value).replace(/\\x60/g, '&#96;');
      }

      function inlineMarkdownToHtml(value) {
        var html = escapeHtml(value);
        html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>');
        html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
        html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');
        html = html.replace(/\\+\\+([^+]+)\\+\\+/g, '<u>$1</u>');
        html = html.replace(/(^|[^*])\\*([^*]+)\\*/g, '$1<em>$2</em>');
        return html;
      }

      function lineToHtml(line) {
        var trimmed = line.trim();
        var imageMatch = /^!\\[([^\\]]*)\\]\\((.+)\\)$/.exec(trimmed);
        if (imageMatch) {
          var uri = imageMatch[2];
          return '<figure data-editor-image="true" contenteditable="false"><img src="' + escapeAttribute(uri) + '" alt="' + escapeAttribute(imageMatch[1] || '图片') + '" /></figure>';
        }
        if (/^---+$/.test(trimmed)) {
          return '<hr />';
        }
        if (/^>\\s?/.test(line)) {
          return '<blockquote><p>' + inlineMarkdownToHtml(line.replace(/^>\\s?/, '')) + '</p></blockquote>';
        }
        var ordered = /^\\d+\\.\\s+(.*)$/.exec(line);
        if (ordered) {
          return '<ol><li>' + inlineMarkdownToHtml(ordered[1]) + '</li></ol>';
        }
        var unordered = /^[-*]\\s+(.*)$/.exec(line);
        if (unordered) {
          return '<ul><li>' + inlineMarkdownToHtml(unordered[1]) + '</li></ul>';
        }
        return '<p>' + (line ? inlineMarkdownToHtml(line) : '<br>') + '</p>';
      }

      function markdownToHtml(markdown) {
        if (!markdown) return '';
        return String(markdown).replace(/\\r\\n?/g, '\\n').split('\\n').map(lineToHtml).join('');
      }

      function textFromNode(node) {
        if (!node) return '';
        if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        var tag = node.tagName.toLowerCase();
        var text = Array.prototype.map.call(node.childNodes, textFromNode).join('');
        if (tag === 'br') return '';
        return text;
      }

      function inlineNodeToMarkdown(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        var tag = node.tagName.toLowerCase();
        var inner = Array.prototype.map.call(node.childNodes, inlineNodeToMarkdown).join('');
        if (tag === 'strong' || tag === 'b') return inner ? '**' + inner + '**' : '';
        if (tag === 'em' || tag === 'i') return inner ? '*' + inner + '*' : '';
        if (tag === 'u') return inner ? '++' + inner + '++' : '';
        if (tag === 's' || tag === 'strike') return inner ? '~~' + inner + '~~' : '';
        if (tag === 'a') {
          var href = node.getAttribute('href') || '';
          return href ? '[' + (inner || href) + '](' + href + ')' : inner;
        }
        if (tag === 'br') return '';
        return inner;
      }

      function blockToMarkdown(node) {
        if (!node) return '';
        if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        var tag = node.tagName.toLowerCase();
        if (tag === 'figure' && node.getAttribute('data-editor-image')) {
          var img = node.querySelector('img');
          var src = img ? img.getAttribute('src') : '';
          var alt = img ? (img.getAttribute('alt') || '图片') : '图片';
          return src ? '![' + alt + '](' + src + ')' : '';
        }
        if (tag === 'hr') return '---';
        if (tag === 'blockquote') {
          return Array.prototype.map.call(node.childNodes, blockToMarkdown).join('\\n').split('\\n').map(function (line) { return line ? '> ' + line : '>'; }).join('\\n');
        }
        if (tag === 'ul' || tag === 'ol') {
          return Array.prototype.map.call(node.children, function (li, index) {
            var prefix = tag === 'ol' ? String(index + 1).padStart(2, '0') + '. ' : '- ';
            return prefix + inlineNodeToMarkdown(li).trim();
          }).join('\\n');
        }
        if (tag === 'div' || tag === 'p' || tag === 'li') return inlineNodeToMarkdown(node).trim();
        return inlineNodeToMarkdown(node).trim();
      }

      function htmlToMarkdown() {
        var blocks = Array.prototype.map.call(editor.childNodes, blockToMarkdown);
        return blocks.join('\\n').replace(/\\n{4,}/g, '\\n\\n\\n');
      }

      function plainText() {
        return (editor.innerText || '').replace(/\\u00a0/g, ' ');
      }

      function post(type) {
        var markdown = htmlToMarkdown();
        lastMarkdown = markdown;
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          markdown: markdown,
          text: plainText()
        }));
      }

      function focusEditor() {
        editor.focus();
        if (document.getSelection && editor.childNodes.length === 0) {
          document.execCommand('insertParagraph', false, null);
        }
      }

      function ensureTrailingParagraph() {
        var last = editor.lastElementChild;
        if (!last || last.tagName.toLowerCase() === 'figure' || last.tagName.toLowerCase() === 'hr') {
          var p = document.createElement('p');
          p.innerHTML = '<br>';
          editor.appendChild(p);
        }
      }

      function insertHtmlAtCursor(html) {
        focusEditor();
        document.execCommand('insertHTML', false, html);
        ensureTrailingParagraph();
        post('change');
      }

      function setMarkdown(markdown, shouldPost) {
        isApplyingExternalValue = true;
        editor.innerHTML = markdownToHtml(markdown || '');
        ensureTrailingParagraph();
        isApplyingExternalValue = false;
        lastMarkdown = htmlToMarkdown();
        if (shouldPost) post('change');
      }

      editor.addEventListener('input', function () {
        if (!isApplyingExternalValue) post('change');
      });
      editor.addEventListener('click', function (event) {
        var image = event.target && event.target.closest ? event.target.closest('figure[data-editor-image] img') : null;
        if (image) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'imagePress', uri: image.getAttribute('src') || '' }));
        }
      });

      window.__diaryEditor = {
        focus: focusEditor,
        setMarkdown: function (markdown) { setMarkdown(markdown, false); },
        insertText: function (text) {
          focusEditor();
          document.execCommand('insertText', false, text || '');
          post('change');
        },
        insertDivider: function () {
          insertHtmlAtCursor('<hr><p><br></p>');
        },
        insertImages: function (uris) {
          var html = (uris || []).map(function (uri) {
            return '<figure data-editor-image="true" contenteditable="false"><img src="' + escapeAttribute(uri) + '" alt="图片" /></figure><p><br></p>';
          }).join('');
          insertHtmlAtCursor(html);
        },
        applyFormat: function (command) {
          focusEditor();
          var map = {
            bold: 'bold',
            italic: 'italic',
            underline: 'underline',
            strikethrough: 'strikeThrough',
            orderedList: 'insertOrderedList',
            unorderedList: 'insertUnorderedList',
            indent: 'indent',
            alignCenter: 'justifyCenter'
          };
          if (command === 'quote') {
            document.execCommand('formatBlock', false, 'blockquote');
          } else if (map[command]) {
            document.execCommand(map[command], false, null);
          }
          post('change');
        }
      };

      setMarkdown(initialMarkdown, false);
      setTimeout(function () { post('ready'); }, 0);
    })();
  </script>
</body>
</html>`

export const WebMarkdownEditor = forwardRef<WebMarkdownEditorHandle, WebMarkdownEditorProps>(
  ({ markdown, placeholder = '请输入...', onChangeMarkdown, onChangePlainText, onImagePress }, ref) => {
    const webViewRef = useRef<any>(null)
    const lastMarkdownFromWebRef = useRef(markdown)
    const readyRef = useRef(false)
    const pendingMarkdownRef = useRef(markdown)

    const html = useMemo(() => createEditorHtml(markdown, placeholder), [])

    const runCommand = useCallback((command: string) => {
      webViewRef.current?.injectJavaScript(`${command}; true;`)
    }, [])

    const setMarkdownInWeb = useCallback(
      (nextMarkdown: string) => {
        pendingMarkdownRef.current = nextMarkdown
        lastMarkdownFromWebRef.current = nextMarkdown
        if (!readyRef.current) {
          return
        }
        runCommand(`window.__diaryEditor && window.__diaryEditor.setMarkdown(${JSON.stringify(nextMarkdown)})`)
      },
      [runCommand],
    )

    React.useEffect(() => {
      if (markdown !== lastMarkdownFromWebRef.current) {
        setMarkdownInWeb(markdown)
      }
    }, [markdown, setMarkdownInWeb])

    useImperativeHandle(
      ref,
      () => ({
        focus: () => runCommand('window.__diaryEditor && window.__diaryEditor.focus()'),
        insertImages: uris =>
          runCommand(
            `window.__diaryEditor && window.__diaryEditor.insertImages(${JSON.stringify(uris)})`,
          ),
        insertText: text =>
          runCommand(
            `window.__diaryEditor && window.__diaryEditor.insertText(${JSON.stringify(text)})`,
          ),
        insertDivider: () =>
          runCommand('window.__diaryEditor && window.__diaryEditor.insertDivider()'),
        applyFormat: command =>
          runCommand(
            `window.__diaryEditor && window.__diaryEditor.applyFormat(${JSON.stringify(command)})`,
          ),
        setMarkdown: setMarkdownInWeb,
      }),
      [runCommand, setMarkdownInWeb],
    )

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        let message: EditorMessage | null = null
        try {
          message = JSON.parse(event.nativeEvent.data) as EditorMessage
        } catch (_err) {
          return
        }

        if (message.type === 'ready') {
          readyRef.current = true
          lastMarkdownFromWebRef.current = message.markdown
          pendingMarkdownRef.current = pendingMarkdownRef.current || message.markdown
          onChangePlainText?.(message.text)
          if (pendingMarkdownRef.current !== message.markdown) {
            setMarkdownInWeb(pendingMarkdownRef.current)
          }
          return
        }

        if (message.type === 'imagePress') {
          if (message.uri) {
            onImagePress?.(message.uri)
          }
          return
        }

        if (message.type === 'change') {
          lastMarkdownFromWebRef.current = message.markdown
          pendingMarkdownRef.current = message.markdown
          onChangeMarkdown(message.markdown)
          onChangePlainText?.(message.text)
        }
      },
      [onChangeMarkdown, onChangePlainText, onImagePress, setMarkdownInWeb],
    )

    return (
      <View style={styles.container}>
        <TypedWebView
          ref={webViewRef}
          source={{ html }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          hideKeyboardAccessoryView
          keyboardDisplayRequiresUserAction={false}
          scrollEnabled
          nestedScrollEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          onMessage={handleMessage}
          style={styles.webView}
          containerStyle={styles.webViewContainer}
          setSupportMultipleWindows={false}
        />
      </View>
    )
  },
)

WebMarkdownEditor.displayName = 'WebMarkdownEditor'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})




