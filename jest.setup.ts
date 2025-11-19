import "@testing-library/jest-dom";

jest.mock("next/link", () => {
  const React = require("react");
  return React.forwardRef(function MockLink(
    { children, href, ...rest }: any,
    ref: any
  ) {
    const resolvedHref = typeof href === "string" ? href : href?.href;
    return React.createElement(
      "a",
      { ref, href: resolvedHref, ...rest },
      children
    );
  });
});
