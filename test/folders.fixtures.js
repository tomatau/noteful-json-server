function makeFoldersArray() {
    return [
        {
            id: 1,
            name: 'Folder Name One'
        },
        {
            id: 2,
            name: 'Folder Name Two'
        },
        {
            id: 3,
            name: 'Folder Name Three'
        },
    ];
}

function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 911,
        name: 
            `Naughty naughty <script>alert("xss");</script> + Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedFolder = {
        ... maliciousFolder,
        name: 
            `Naughty naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt; + Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }   // converts script to render it inert + onerror="alert(document.cookie);" gets removed

    return {
        maliciousFolder,
        expectedFolder
    }
}

module.exports = {
    makeFoldersArray,
    makeMaliciousFolder
};