# Ether Dream Tools Examples

To run these examples, only Node v8+, `yarn` and a Mac or Linux OS is required.

Clone this repository. In the repository root, run `yarn`.

After installing the dependencies, run `EXAMPLE=static-shapes yarn watch` in the **repository root** to start e.g. the static-shapes example.

Now open `http://localhost:8080` to see the example in your browser!

If you want to also test it on the real physical Ether Dream device, use `EXAMPLE=static-shapes yarn watch --device`.

## Instructions for interactive examples

The `square-interactive` example exposes two ports, `8080` and `8321`. Open `http://localhost:8080` in one browser window, and open `http://localhost:8123` in the other one.
