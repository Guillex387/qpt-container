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
        new Error('The file that you has added is void') // code 3
    ],
    encrypter: [
        new Error('Incorrect key'), // code 0
        new Error('Invalid key') // code 1
    ]
}
export async function handleError(func: () => any, cb: (rolError: string, message: string) => void): Promise<void> {
    try {
        await func();
    } catch (error) {
        let rolError = 'Unknown';
        let errorCode = -1;
        for (let i = 0; i < errors.disk.length; i++) {
            if (error === errors.disk[i]) {
                rolError = 'Disk';
                errorCode = i;
                break;
            }
        }
        if (errorCode !== -1) {
            for (let i = 0; i < errors.container.length; i++) {
                if (error === errors.container[i]) {
                    rolError = 'Container';
                    errorCode = i;
                    break;
                }
            }
            if (errorCode !== -1) {
                for (let i = 0; i < errors.encrypter.length; i++) {
                    if (error === errors.encrypter[i]) {
                        rolError = 'Encrypter';
                        errorCode = i;
                        break;
                    }
                }
            }
        }
        cb(rolError, error.message);
    }
}
export default errors;