const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function removeDuplicateAttrs(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const valuesDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res/values"
      );

      if (fs.existsSync(valuesDir)) {
        const files = fs.readdirSync(valuesDir).filter(f => f.endsWith(".xml"));
        for (const file of files) {
          const filePath = path.join(valuesDir, file);
          let content = fs.readFileSync(filePath, "utf8");

          // Remove duplicate actionBarSize declaration
          content = content.replace(
            /<attr name="actionBarSize"[\s\S]*?\/>/g,
            ""
          );

          fs.writeFileSync(filePath, content);
        }
      }

      return config;
    },
  ]);
};
