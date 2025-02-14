declare module "mac-windows" {
  export type MacWindow = {
    name: string;
    title: string;
    pid: number;
    ownerName: string; // ✅ Add this missing property
    x: number;
    y: number;
    width: number;
    height: number;
    number: number;
  };

  const macWindows: {
    getWindows: () => Promise<MacWindow[]>;
    activateWindow: (windowId: number) => Promise<void>;
  };

  export default macWindows;
}
