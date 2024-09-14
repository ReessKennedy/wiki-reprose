import EasyMDE from "easymde";
import auth from "../../utils/auth";
import { decode, encode } from "js-base64";
import fm from "front-matter";
import { stringify } from "yaml";

window.editor = () => ({
  editor: null,
  owner: null,
  path: null,
  sha: null,
  settingsDisplayed: false,
  saving: false,
  attributes: {
    title: "",
    description: "",
  },
  body: "",

  async init() {
    this.owner = await auth.username();

    this.path = this.getPathFromLocation();

    this.editor = new EasyMDE({
      element: this.$refs.input,
      spellChecker: false,
    });

    await this.load();
    await this.update();
  },

  getPathFromLocation() {
    return new URL(window.location.href).searchParams.get("selected");
  },

  getFilename() {
    const _path = this.path.split("/");
    return _path.slice(_path.length - 1, _path.length);
  },

  getBody() {
    return this.editor.value();
  },

  getAttributes() {
    const data = new FormData(this.$root);
    const keys = data.getAll("attributes[key][]");
    const values = data.getAll("attributes[value][]");

    const attributes = keys.reduce((keyValues, key, index) => {
      keyValues[key] = values[index];

      return keyValues;
    }, {});

    return {
      ...attributes,
      title: this.attributes.title,
    };
  },

  toggleSettings() {
    this.settingsDisplayed = !this.settingsDisplayed;
  },

  async load() {
    const { content, sha } = await this.fetchContents();
    const { attributes, body } = fm(decode(content));

    this.attributes = {
      description: "",
      ...attributes,
    };
    this.body = body;
    this.sha = sha;
  },

  async update() {
    this.editor.value(this.body);
  },

  async save() {
    this.saving = true;

    const { content } = await this.putContents();
    const { sha } = content;

    this.sha = sha;

    this.saving = false;
  },

  async fetchContents() {
    const _path = this.path.split("/");
    const repo = _path[0];
    const path = _path.slice(1).join("/");

    const url = `GET /repos/${this.owner}/${repo}/contents/${path}`;

    return (await auth.oktokit().request(url)).data;
  },

  async putContents() {
    const _path = this.path.split("/");
    const repo = _path[0];
    const path = _path.slice(1).join("/");
    const url = `PUT /repos/${this.owner}/${repo}/contents/${path}`;

    const content = `---\n${stringify(this.getAttributes()).trim()}\n---\n${this.getBody().trim()}`;

    return (
      await auth.oktokit().request(url, {
        path,
        message: `Update ${this.getFilename()} via Reprose`,
        sha: this.sha,
        content: encode(content),
      })
    ).data;
  },
});
