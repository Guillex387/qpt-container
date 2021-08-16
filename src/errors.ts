const errors = {
    disk: [
        new Error('The disk doesn\'t exist'), // code 0
        new Error('The disk already exist'), // code 1
        new Error('The file doesn\'t exist'), // code 2
        new Error('The folder doesn\'t exist'), // code 3
        new Error('Error getting file'), // code 4
        new Error('Error getting folder'), // code 5
        new Error('The file already exists'), // code 6
        new Error('The folder already exists'), // code 7
        new Error('Error removing some files') // code 8
    ],
    container: [
        new Error('The container already exists'), // code 0
        new Error('The container doesn\'t exists'), // code 1
        new Error('The content address doesn\'t exists'), // code 2
        new Error('The file that you has added is void'), // code 3
        new Error('Format error') // code 4
    ],
    encrypter: [
        new Error('Incorrect key'), // code 0
        new Error('Invalid key') // code 1
    ],
    exporter: [
        new Error('The import file is not a disk'), // code 0
        new Error('Error exporting the disk') // code 1
    ],
}
export async function handleError(func: () => any, cb: (rolError: string, message: string) => void): Promise<void> {
    try {
        await func();
    } catch (error) {
        let rolError = 'Unknown';
        let errorCode = -1;
        for (const key in errors) {
            for (let i = 0; i < errors[key].length; i++) {
                const err = errors[key][i];
                if (err === error) {
                    rolError = key;
                    rolError = rolError[0].toUpperCase() + rolError.substr(1);
                    errorCode = i;
                }
            }
        }
        cb(rolError, error.message);
    }
}
export default errors;