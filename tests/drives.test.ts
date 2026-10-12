import { describe, expect, test } from "bun:test";
import { listDrives, parseLsblkJson } from "../src/core/system/drives";

describe("core drives service", () => {
  test("parseLsblkJson parses nested block devices and excludes swap and boot", () => {
    const fixture = JSON.stringify({
      blockdevices: [
        {
          name: "sda",
          path: "/dev/sda",
          mountpoint: null,
          label: null,
          size: "500G",
          rm: false,
          hotplug: false,
          tran: "sata",
          type: "disk",
          children: [
            {
              name: "sda1",
              path: "/dev/sda1",
              mountpoint: "/boot",
              label: "BOOT",
              size: "1G",
              rm: false,
              hotplug: false,
              tran: null,
              type: "part",
            },
            {
              name: "sda2",
              path: "/dev/sda2",
              mountpoint: "/",
              label: "RootOS",
              size: "200G",
              rm: false,
              hotplug: false,
              tran: null,
              type: "part",
            },
            {
              name: "sda3",
              path: "/dev/sda3",
              mountpoint: "[SWAP]",
              label: "swap",
              size: "4G",
              rm: false,
              hotplug: false,
              tran: null,
              type: "part",
            },
          ],
        },
        {
          name: "sdb",
          path: "/dev/sdb",
          mountpoint: null,
          label: null,
          size: "32G",
          rm: true,
          hotplug: true,
          tran: "usb",
          type: "disk",
          children: [
            {
              name: "sdb1",
              path: "/dev/sdb1",
              mountpoint: "/run/media/user/PENDRIVE",
              label: "PENDRIVE",
              size: "32G",
              rm: true,
              hotplug: true,
              tran: null,
              type: "part",
              fstype: "vfat",
            },
          ],
        },
      ],
    });

    const drives = parseLsblkJson(fixture);
    expect(drives.length).toBe(2);

    const rootDrive = drives.find((d) => d.name === "sda2");
    expect(rootDrive).toBeDefined();
    expect(rootDrive?.mountpoint).toBe("/");
    expect(rootDrive?.label).toBe("RootOS");
    expect(rootDrive?.isRemovable).toBe(false);

    const usbDrive = drives.find((d) => d.name === "sdb1");
    expect(usbDrive).toBeDefined();
    expect(usbDrive?.mountpoint).toBe("/run/media/user/PENDRIVE");
    expect(usbDrive?.label).toBe("PENDRIVE");
    expect(usbDrive?.isRemovable).toBe(true);
    expect(usbDrive?.fstype).toBe("vfat");
  });

  test("parseLsblkJson generates default label for unlabelled partitions", () => {
    const fixture = JSON.stringify({
      blockdevices: [
        {
          name: "sdc1",
          path: "/dev/sdc1",
          mountpoint: "/mnt/data",
          label: null,
          size: "1TB",
          rm: false,
          tran: "sata",
        },
      ],
    });

    const drives = parseLsblkJson(fixture);
    expect(drives.length).toBe(1);
    expect(drives[0]?.label).toBe("data");
  });

  test("parseLsblkJson handles empty or invalid json gracefully", () => {
    expect(parseLsblkJson("")).toEqual([]);
    expect(parseLsblkJson("invalid json {}")).toEqual([]);
    expect(parseLsblkJson("{}")).toEqual([]);
  });

  test("listDrives runs without throwing error", async () => {
    const drives = await listDrives();
    expect(Array.isArray(drives)).toBe(true);
  });
});
