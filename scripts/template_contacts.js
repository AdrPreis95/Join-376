function getTemplateContacts () {
    return `<template id="contactTemplate">
                <div class="contactItem">
                    <div class="contactWrapper" style="width: 80%; display: flex; align-items: center;">
                        <div class="initialsCircle"></div>
                        <div class="contactDetails">
                            <p style="display: flex; align-items: center; font-size: 18px;">
                                <span class="contactName"></span>
                            </p>
                            <p><span class="contactEmail"></span></p>
                        </div>
                    </div>
                </div>
            </template>`
}