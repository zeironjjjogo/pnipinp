import { OptionKeys, type OptionKeys_T } from ":=/options";

type OptElems_T = [HTMLDivElement, HTMLLabelElement, HTMLInputElement];
type OptElemsContainer = {
    [k in OptionKeys_T]: OptElems_T;
};

export class Factor {
    private readonly m_optElems: OptElemsContainer;

    private readonly m_submitBtn: HTMLAnchorElement;

    private static createComponent(): OptElems_T {
        return [
            document.createElement("div"),
            document.createElement("label"),
            document.createElement("input")
        ];
    }

    private static initHTML(): [HTMLDivElement, HTMLAnchorElement] {
        const html = document.querySelector("html");
        const title = document.querySelector("title");
        const headline = document.querySelector("h1");
        const form = document.querySelector<HTMLDivElement>("div#form-area");
        const submitButton = document.querySelector("a");

        if (!(html && title && headline && form && submitButton)) {
            throw Error("HTML structure is invalid");
        }

        html.lang = chrome.i18n.getUILanguage();
        title.innerText = chrome.i18n.getMessage("optionTitle");
        headline.innerText = chrome.i18n.getMessage("optionH1");
        submitButton.innerText = chrome.i18n.getMessage("optionSubmitButton");

        return [form, submitButton];
    }

    constructor() {
        const [parent, submitBtn] = Factor.initHTML();
        this.m_submitBtn = submitBtn;

        const optElems: Partial<OptElemsContainer> = {};
        
        for (const key of OptionKeys) {
            const elems = Factor.createComponent();

            for (const i of [1, 2] as const) {
                elems[0].appendChild(elems[i]);
            }

            elems[0].classList.add("option-frame");

            elems[1].classList.add("option-label");
            elems[1].innerText = chrome.i18n.getMessage(key);

            elems[2].id = key;
            elems[2].type = "checkbox";
            elems[2].classList.add("option-checkbox");

            parent.appendChild(elems[0]);
            optElems[key] = elems;
        }
        this.m_optElems = optElems as OptElemsContainer;
    }

    get elems(): OptElemsContainer {
        return this.m_optElems;
    }

    get submitButton(): HTMLAnchorElement {
        return this.m_submitBtn;
    }
};
