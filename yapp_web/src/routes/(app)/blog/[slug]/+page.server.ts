import type { PageServerLoad } from './$types';
import { BlogPost } from "$lib/utils/blog/blog";
import { BlogService } from '$lib/utils/blog/blogUtilsSS';
import { UserService } from '$lib/utils/auth/UserService';

import { generateHTML } from '@tiptap/html';

import StarterKit from '@tiptap/starter-kit';
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Blockquote from "@tiptap/extension-blockquote";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mathematics from "@tiptap/extension-mathematics";
import TextAlign from "@tiptap/extension-text-align";
import { CustomImage } from '$lib/svelteComponents/tiptap/TTImage';


export const load: PageServerLoad = async(event) => {
	const { slug } = event.params;
    const requestedVersionId = event.url.searchParams.get("version");
    const session = await event.locals.auth()
    const user = await UserService.readUser("email", session?.user?.email)

    let blogPost: BlogPost[] = await BlogService.readBlogPost(slug);
    const rawPost = blogPost[0];

    if (!rawPost) {
        return { 
            slug,
            user: user ? JSON.parse(JSON.stringify(user)) : null,
            blogPost: null 
        };
    }

    const publicVersions = rawPost.versions
        ?.filter(v => v.isPublicVersion === true)
        .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()) || [];

    if (publicVersions.length === 0) {
        return {
            slug,
            user: user ? JSON.parse(JSON.stringify(user)) : null,
            blogPost: {
                id: rawPost.id,
                title: rawPost.title,
                titleImageId: rawPost.titleImageId,
                currentVersion: null,
                availableVersions: []
            }
        };
    }

    let activeVersion = requestedVersionId 
        ? publicVersions.find(v => v.id === requestedVersionId)
        : publicVersions.find(v => v.isMainVersion === true);

    if (!activeVersion) {
        activeVersion = publicVersions.find(v => v.isMainVersion === true) || publicVersions[0];
    }

    let parsedHTML = "";
    if(activeVersion?.versionData?.content) {
        try {
            parsedHTML = generateHTML(activeVersion.versionData.content, [
                StarterKit, Link, Highlight, Subscript, Superscript, Mathematics, 
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                CustomImage
            ])
        } catch(error) {
            console.error("Failed to parse TipTap JSON to HTML: ", error, )
        }
    }

    const safeActiveVersion = {
        id: activeVersion.id,
        versionNumber: activeVersion.versionNumber,
        isMainVersion: activeVersion.isMainVersion,
        creationDate: activeVersion.creationDate,
        lastChangeDate: activeVersion.lastChangeDate,
        versionData: activeVersion.versionData,
        parsedHtml: parsedHTML
    };

    const availableVersions = publicVersions.map(v => ({
        id: v.id,
        versionNumber: v.versionNumber,
        isMainVersion: v.isMainVersion,
        creationDate: v.creationDate
    }));

    const safePost = {
        id: rawPost.id,
        title: rawPost.title, 
        titleImageId: rawPost.titleImageId,
        currentVersion: safeActiveVersion,
        availableVersions: availableVersions
    };

    return { 
        slug,
        user: user ? JSON.parse(JSON.stringify(user)) : null,
        blogPost: JSON.parse(JSON.stringify(safePost)),
    };
}
