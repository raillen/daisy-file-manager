import solidPlugin from "@opentui/solid/bun-plugin";

type Target = {
  name: string;
  compile: {
    target: string;
    outfile: string;
  };
  define: Record<string, string>;
};

const targets: Target[] = [
  {
    name: "linux-x64-glibc",
    compile: { target: "bun-linux-x64", outfile: "./dist/daisy-linux-x64" },
    define: { "process.env.OPENTUI_LIBC": JSON.stringify("glibc") },
  },
  {
    name: "linux-x64-musl",
    compile: { target: "bun-linux-x64-musl", outfile: "./dist/daisy-linux-x64-musl" },
    define: { "process.env.OPENTUI_LIBC": JSON.stringify("musl") },
  },
];

export async function build(targetsToBuild: Target[] = targets) {
  for (const target of targetsToBuild) {
    const libc = target.name.includes("musl") ? "musl" : "glibc";
    console.log(`buildando ${target.name} (libc=${libc})`);
    const result = await Bun.build({
      entrypoints: ["./index.tsx"],
      target: "bun",
      compile: target.compile,
      define: target.define,
      plugins: [solidPlugin],
    });
    if (!result.success) {
      console.error(`Falha ao buildar ${target.name}:`, result.logs);
      process.exit(1);
    }
  }
}

if (import.meta.main) {
  const only = process.argv[2];
  const selected = only === undefined ? targets : targets.filter((target) => target.name.includes(only));
  await build(selected);
}
