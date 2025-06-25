import { config } from "./config";
import typescriptLogo from "./typescript.svg";


export function render(_url: string) {
	const html = `
    <div>
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
        <img src="${typescriptLogo}" class="logo vanilla" alt="JavaScript logo" />
      </a>
      <h1>Hello Vite!</h1>
    </div>
    <section>
      <h2>Configuration</h2>
      <pre><code>${JSON.stringify(config, null, 2)}</code></pre>
    </section>
  `;
	return { html };
}
