import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact_recommended from "eslint-plugin-react/configs/recommended.js";

export default [
  {
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
        Buffer: "readonly",
        require: "readonly"
      }
    },
    settings: {
      react: { version: "detect" }
    }
  },
  pluginJs.configs.recommended,
  pluginReact_recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "react/prop-types": "off",
      "no-unused-labels": "off",
      "no-prototype-builtins": "off"
    }
  }
];