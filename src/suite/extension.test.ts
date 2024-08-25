import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to it it
import { parseCommentContent } from "../core";
// import * as myExtension from '../../extension';

describe("Web Extension Test Suite", () => {
  describe("parseCommentContent Tests", () => {
    it("should parse title and description correctly", () => {
      const input =
        "TODO: title: fix extensions.ts description: something is wrong with it";
      const expectedOutput = {
        id: "",
        title: "fix extensions.ts",
        description: "something is wrong with it",
      };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should parse title and description with another input", () => {
      const input =
        "FIXME: title: another title description: another description";
      const expectedOutput = {
        id: "",
        title: "another title",
        description: "another description",
      };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should parse without title and description", () => {
      const input = "FIX: this is a simple fix without title and description";
      const expectedOutput = {
        id: "",
        title: "this is a simple fix without title and description",
        description: "",
      };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should parse only title provided", () => {
      const input = "TODO: title: only title provided";
      const expectedOutput = {
        id: "",
        title: "only title provided",
        description: "",
      };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should parse only description provided", () => {
      const input = "TODO: description: only description provided";
      const expectedOutput = {
        id: "",
        title: "description: only description provided",
        description: "",
      };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should handle empty input", () => {
      const input = "";
      const expectedOutput = { id: "", title: "", description: "" };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should handle input without TODO/FIX/FIXME", () => {
      const input = "Just some random comment";
      const expectedOutput = { id: "", title: "", description: "" };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should handle extraneous text before title and description", () => {
      const input = "TODO: ahaha title: blah description: blah blah";
      const expectedOutput = {
        id: "",
        title: "blah",
        description: "blah blah",
      };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });

    it("should parse title and description correctly with HTML content", () => {
      const input =
        'FIXME: Weird description: <a href="evil.com">This is a todo-tracker FIXME comment</a>';
      const expectedOutput = {
        id: "",
        title: "Weird",
        description:
          '<a href="evil.com">This is a todo-tracker FIXME comment</a>',
      };
      assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
    });
  });

  it("should parse a string with an ID, title, and description correctly", () => {
    const input =
      'FIXME-VJEXkJ: XSSAAA description: <a href="test.com">This is a todo-tracker FIXME comment</a>';
    const expectedOutput = {
      id: "VJEXkJ",
      title: "XSSAAA",
      description:
        '<a href="test.com">This is a todo-tracker FIXME comment</a>',
    };
    assert.deepStrictEqual(parseCommentContent(input), expectedOutput);
  });
});
