import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact_recommended from "eslint-plugin-react/configs/recommended.js";

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  pluginReact_recommended,
];