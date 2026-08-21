export default interface IController {
    setCur(sec: number): unknown;
    isValid(): boolean;
    dispose(): void;
};
