// Imports mocha for the browser, defining the `mocha` global.
import "mocha/mocha";

mocha.setup({
  ui: "tdd",
  reporter: undefined,
});

export function run(): Promise<void> {
  return new Promise((c, e) => {
    try {
      // Run the mocha todo-tracker
      mocha.run((failures) => {
        if (failures > 0) {
          e(new Error(`${failures} todo-trackers failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      console.error(err);
      e(err);
    }
  });
}
