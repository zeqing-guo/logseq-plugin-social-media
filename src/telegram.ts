import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import axios from "axios";

const orgToMarkdown = require('org-to-markdown');

export async function telegramSendMsg(blockContent: BlockEntity) {
    const msg = await flattenForTelegram(blockContent, 0);
    let settings = logseq.settings;
    if (settings !== undefined) {
        const botToken: string = settings['telegramBotToken'];
        const channelName: string = settings['telegramChannelName'];
        if (botToken === '' || channelName === '') {
            return;
        }
        let content = msg.content.replace(/\[\[/g, '#').replace(/\]\]/g, '');

        content = content.replace(/\*\*/g, '_');

        content = content.replace(/\./g, '\\.')
             .replace(/\[/g, "\\[")
             .replace(/\]/g, "\\]")
             .replace(/\#/g, "\\#")
             .replace(/\-/g, "\\-")
             .replace(/\+/g, "\\+")
             .replace(/\|/g, "\\|")
             .replace(/\(/g, "\\(")
             .replace(/\)/g, "\\)")
             .replace(/\{/g, "\\{")
             .replace(/\}/g, "\\}")
             .replace(/\!/g, "\\!")
             .replace(/\=/g, "\\=")
             .replace(/\~/g, "\\~")
             .replace(/\>/g, "\\>")
             .replace(/\`/g, "\\`");
        console.log(content);
        const response = await axios.get(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            params: {
                'chat_id': channelName,
                'text': content,
                'parse_mode': 'MarkdownV2'
            }
        });
        if (response.status !== 200) {
            console.error(response.data);
        } else {
            logseq.UI.showMsg('Message has send to telegram', 'success', { 'timeout': 2000 });
        }
        // if (msg.photo.length === 0) {
        //     const response = await axios.get(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        //         params: {
        //             'chat_id': channelName,
        //             'text': content,
        //             'parse_mode': 'MarkdownV2'
        //         }
        //     });
        //     if (response.status !== 200) {
        //         console.error(response.data);
        //     }
        // } else if (msg.photo.length === 1) {
        //     try {
        //         const p = fs.readFileSync(msg.photo[0]);
        //         let body = new FormData();
        //         body.append('photo', p);
        //         const response = await axios.postForm(
        //             `https://api.telegram.org/bot${botToken}/sendPhoto`,
        //             body,
        //             {
        //                 headers: { 'Content-Type': 'multipart/form-data' },
        //                 params: {
        //                     'chat_id': channelName,
        //                     'caption': content,
        //                     'parse_mode': 'MarkdownV2'
        //                 }
        //             }
        //         );
        //         if (response.status !== 200) {
        //             console.error(response.data);
        //         }
        //     } catch (err) {
        //         console.error(err);
        //     }
        // } else if (msg.photo.length > 1) {
        //     let photo: string[];
        //     if (msg.photo.length > 10) {
        //         photo = msg.photo.slice(0, 10);
        //     } else {
        //         photo = msg.photo;
        //     }
        //     try {
        //         const media = photo.map((path, i) => {
        //             if (i !== 0) {
        //                 return {
        //                     type: 'photo',
        //                     media: fs.createReadStream(path)
        //                 };
        //             } else {
        //                 return {
        //                     type: 'photo',
        //                     media: fs.createReadStream(path),
        //                     caption: content
        //                 };
        //             }
        //         });
        //         const body = new FormData();
        //         body.append('media', media);
        //         const response = await axios.postForm(
        //             `https://api.telegram.org/bot${botToken}/sendMediaGroup`,
        //             body,
        //             {
        //                 headers: { 'Content-Type': 'multipart/form-data' },
        //                 params: {
        //                     'chat_id': channelName,
        //                     'caption': content,
        //                     'parse_mode': 'MarkdownV2'
        //                 }
        //             }
        //         );
        //         if (response.status !== 200) {
        //             console.error(response.data);
        //         }
        //     } catch (err) {
        //         console.error(err);
        //     }
        // }
    }
}

function formatContent(content: string): { content: string, photo: string[] } {
    const re = new RegExp(/!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g);
    const result = re[Symbol.matchAll](content);
    const photo: string[] = Array.from(result, x => {
        return x[1];
    });
    const newContent = re[Symbol.replace](content, '');

    return {
        content: newContent,
        photo: photo
    };
}

async function flattenForTelegram(blockContent: BlockEntity, level: number): Promise<{ content: string, photo: string[] }> {
    let content = blockContent.content;
    if (blockContent.format === 'org') {
        content = (await orgToMarkdown(content)).toString();
    }
    const formatedContent = formatContent(content);
    content = formatedContent.content;
    let photo = formatedContent.photo;
    const children = blockContent.children;
    if (children !== undefined) {
        for (let child of children) {
            if ('children' in child) {
                const childChild = await flattenForTelegram(child, level + 1);
                photo = photo.concat(childChild.photo);
                if (childChild.content !== '') {
                    content = content + '\n' + '   '.repeat(level + 1) + '- ' + childChild.content;
                }
            } else {
                const childBlock = await logseq.Editor.getBlock(child[1], { includeChildren: false });
                if (childBlock !== null) {
                    let childContent = childBlock.content;
                    if (childBlock.format === 'org') {
                        childContent = (await orgToMarkdown(childBlock.content)).toString();
                    }
                    const fc = formatContent(childContent);
                    photo = photo.concat(fc.photo);
                    if (fc.content !== '') {
                        content = content + '\n' + '   '.repeat(level + 1) + '- ' + fc.content;
                    }
                }
            }
        }
    }
    return { content: content, photo: photo };
}