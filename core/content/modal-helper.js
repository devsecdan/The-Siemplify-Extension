var ModalHelper = (function () {

    class Modal {
        constructor(title, body=null) {
            this.modalContainer = document.createElement("div");
            this.modalContainer.setAttribute("id", "extension-modal");
            this.modalContainer.setAttribute("style", "\
                position: fixed;\
                z-index: 100000;\
                padding-top: 100px;\
                left: 0;\
                top: 0;\
                width: 100%;\
                height: 100%;\
                overflow: auto;\
                background-color: rgba(0,0,0,0.4);\
            ");

            this.modalWindow = document.createElement("div");
            this.modalWindow.setAttribute("style", "\
                background-color: #232330;\
                margin: auto;\
                padding: 20px;\
                border: 1px solid rgb(48, 48, 69);\
                border-left: 5px solid #db141a;\
                width: fit-content;\
                width: -moz-fit-content;\
                display: block;\
            ");   

            // Header
            this.header = document.createElement("div");
            this.header.setAttribute("style", "\
                display: flex;\
                justify-content: space-between;\
                align-items: flex-start;\
                margin-bottom: 1em;\
            ");

            this.title = document.createElement("h3");
            this.title.textContent = title;
            this.header.insertAdjacentElement("beforeend", this.title);

            this.closeButton = document.createElement("smp-icon");
            this.closeButton.setAttribute("style", "cursor: pointer;")

            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "24px");
            svg.setAttribute("height", "24px");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svg.setAttribute("fill", "currentColor");

            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", "M17.642 7.842a1.05 1.05 0 10-1.484-1.484L12 10.515 7.843 6.358a1.05 1.05 0 10-1.485 1.484L10.515 12l-4.157 4.157a1.05 1.05 0 001.485 1.485L12 13.485l4.158 4.157a1.05 1.05 0 001.484-1.485L13.485 12l4.157-4.158z");
            svg.appendChild(path);
            
            this.closeButton.appendChild(svg);
            this.closeButton.addEventListener("click", () => this.destroyModal.bind(this)());
            this.header.insertAdjacentElement("beforeend", this.closeButton);

            // Content
            this.content = document.createElement("div");
            this.content.setAttribute("style", "\
                margin-bottom: 1em;\
            ");
            if (body) {
                this.content.insertAdjacentElement("afterbegin", body);
            }

            // Footer
            this.footer = document.createElement("div");
            this.footer.setAttribute("style", "\
                display: flex;\
                justify-content: flex-end;\
            ");

            this.cancelButton = document.createElement("input");
            this.cancelButton.setAttribute("id", "tse-modal-cancel");
            this.cancelButton.setAttribute("type", "button");
            this.cancelButton.setAttribute("value", "Cancel");
            this.cancelButton.addEventListener("click", () => this.destroyModal.bind(this)());
            this.cancelButton.setAttribute("style", "background-color: rgb(44, 44, 62);\
            color: rgb(204, 204, 218);\
            border-radius: 4px;\
            border-style: none;\
            border-color: transparent;\
            width: 5em;\
            padding: 0.25em 0.5em;\
            margin-right: 0.5em;\
            outline: none 0 transparent;\
            border: 1px solid transparent;\
            font-family: \"Open Sans\", sans-serif;\
            vertical-align: middle;");
            this.submitButton = document.createElement("input");
            this.submitButton.setAttribute("id", "tse-modal-submit");
            this.submitButton.setAttribute("type", "button");
            this.submitButton.setAttribute("value", "Confirm");
            this.submitButton.setAttribute("style", "background-color: #b01117;\
            color: rgb(204, 204, 218);\
            border-radius: 4px;\
            border-style: none;\
            border-color: transparent;\
            width: 5em;\
            padding: 0.25em 0.5em;\
            margin-right: 0.5em;\
            outline: none 0 transparent;\
            border: 1px solid transparent;\
            font-family: \"Open Sans\", sans-serif;\
            vertical-align: middle;");

            this.footer.insertAdjacentElement("beforeend", this.cancelButton);
            this.footer.insertAdjacentElement("beforeend", this.submitButton);
            

            this.modalWindow.insertAdjacentElement("beforeend", this.header);
            this.modalWindow.insertAdjacentElement("beforeend", this.content);
            this.modalWindow.insertAdjacentElement("beforeend", this.footer);
            this.modalContainer.insertAdjacentElement("afterbegin", this.modalWindow);
        }

        displayModal() {
            document.body.insertAdjacentElement("beforeend", this.modalContainer);
        }

        destroyModal() {
            this.modalContainer.remove();
        }
    }

    return {
        Modal: Modal
    }

})();