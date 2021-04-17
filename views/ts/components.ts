const disksContainer = document.querySelector('.disk-content');
const previewContainer = document.querySelector('.file-preview');
export interface FileI {
    type: "file";
    name: string;
    mimeType: string;
}
export interface FolderI {
    type: "folder";
    name: string;
    content: (FileI | FolderI)[];
}
export const loadFile = (filename: string, path: string, onlyRender: boolean = false) => {
    const render = () => `
    <li class="file" id="${path}">
        <img class="icon" src="./img/file.svg">
        <div class="no-wrap" ondblclick="preview('${path}')">${filename}</div>
        <div class="file-menu">
            <img class="exp" src="./img/export.svg" onclick="exportFile('${path}')">
            <img class="del" src="./img/delete-svgrepo-com.svg" onclick="rmFile('${path}')">
        </div>
    </li>
    `;
    if(onlyRender){
        return render();
    }
    let segments = path.split('/');
    segments.pop();
    let newPath = '';
    segments.forEach((e,i) => {
        if(i === (segments.length - 1)){
            newPath += e;
        }else{
            newPath += `${e}/`;
        }
    });
    document.getElementById(newPath).children[1].innerHTML += render();
};
export const loadFolder = (props: FolderI, path: string, onlyRender: boolean = false) => {
    const render = () => `
    <li id="${path}">
        <span class="caret">
            <img src="./img/flecha-apunta-a-la-derecha.svg" onclick="activeList(this.parentElement)">
            <img src="./img/carpeta.svg">
            <div class="no-wrap">${props.name}</div>
            <div class="folder-menu">
                <button onclick="newFiles('${path}')"><img src="./img/add-file.svg"></button>
                <button onclick="folderMaker('${path}')"><img src="./img/add-folder.svg"></button>
                <button onclick="rmFolder('${path}')"><img src="./img/delete-svgrepo-com.svg"></button>
            </div>
        </span>
        <ul class="nested">
        ${((): string => {
        let out = '';
        props.content.forEach(el => {
            if (el.type == 'file') {
                out += loadFile(el.name, `${path}/${el.name}`, true);
            } else if (el.type == 'folder') {
                out += loadFolder(el, `${path}/${el.name}`, true);
            }
        });
        return out;
    })()}
        </ul>
    </li>
    `;
    if(onlyRender){
        return render();
    }
    let segments = path.split('/');
    segments.pop();
    let newPath = '';
    segments.forEach((e,i) => {
        if(i === (segments.length - 1)){
            newPath += e;
        }else{
            newPath += `${e}/`;
        }
    });
    document.getElementById(newPath).children[1].innerHTML += render();
}
export const loadDisk = (name: string, content: (FileI | FolderI)[]): void => {
    disksContainer.innerHTML += `
    <li id="${name}">
        <span class="caret">
            <img src="./img/flecha-apunta-a-la-derecha.svg" onclick="activeList(this.parentElement)">
            <img src="./img/hard-drive.svg">
            <div>${name}</div>
            <div class="folder-menu">
                <button onclick="newFiles('${name}')"><img src="./img/add-file.svg"></button>
                <button onclick="folderMaker('${name}')"><img src="./img/add-folder.svg"></button>
            </div>
        </span>
        <ul class="nested">
        ${((): string => {
            let out = '';
            content.forEach(el => {
                if (el.type == 'file') {
                    out += loadFile(el.name, `${name}/${el.name}`, true);
                } else if (el.type == 'folder') {
                    out += loadFolder(el, `${name}/${el.name}`, true);
                }
            });
            return out;
        })()}
        </ul>
    </li>
    `;
};
export const loadPreviewer = (fileName: string, blobUrl: string, mimeType: string = ''): void => {
    (async (): Promise<string> => {
        let component = '';
        let initType = mimeType.split('/')[0];
        if (initType === 'image') {
            component = `<img style="max-height: 80%;max-width: 80%" src="${blobUrl}">`;
        } else if (mimeType === 'application/pdf') {
            component = `<embed width="100%" height="100%" src="${blobUrl}#toolbar=0">`;
        } else if (initType === 'video') {
            component = `
            <video controls controlslist="nodownload" style="max-height: 70%;max-width: 70%;outline: none;">
                <source src="${blobUrl}" type="${mimeType}">
            </video>
            `;
        } else if (initType === 'audio') {
            component = `
            <audio controls controlslist="nodownload" style="outline: none;">
                <source src="${blobUrl}" type="${mimeType}">
            </audio>
            `;
        } else if (mimeType === 'text/plain') {
            component = `<embed style="background-color: white;" width="100%" height="100%" src="${blobUrl}">`;
        } else {
            component = `
            <div style="background-color: #ff3535;padding: 30px;border-radius: 5px;">
                <strong style="background-color: #ff3535;color: #6b0000;">Formato desconocido</strong>
            </div>
            `;
        }
        return component;
    })().then(component => {
        previewContainer.innerHTML = `
        <header>
            <div class="no-wrap">${fileName}</div>
            <img src="./img/close.svg" onclick="clearPreview()">
        </header>
        <section class="preview">${component}</section>
        `;
    });
};
export function clearPreview(): void {
    previewContainer.innerHTML = '';
}
export function activeList(node: any) {
    let arrowHtml = node.childNodes[1];
    let ulNode = node.parentElement.childNodes[3];
    if (ulNode.className == 'nested') {
        ulNode.className = 'active';
        arrowHtml.className = 'arrow-deploy';
    } else {
        ulNode.className = 'nested';
        arrowHtml.className = 'arrow-nested';
    }
}