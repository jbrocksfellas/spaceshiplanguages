import Head from "next/head";
import Link from "next/link";
import { gql } from "@apollo/client";

import { getApolloClient } from "../../lib/apollo-client";
import parse from "html-react-parser";
import styles from "../../styles/Home.module.css";
import categoryStyles from './category.module.css'

const LENGTH = 100;

export default function Category({ posts, slug, categorySeo, ...props }) {
    console.log("categorySeo", categorySeo)
    const postExcerptShorten = (excerpt) => {
        const newExcerpt = excerpt ? `${excerpt.substring(0, LENGTH)} [...]</p>` : excerpt
        // console.log("newExcerpt", newExcerpt)
        return newExcerpt
    }
    const title = slug.replace(/-/g, " ")
    const fullHead = categorySeo?.fullHead ? parse(categorySeo?.fullHead) : null;
    // return <></>
    return (
        <div className={styles.container}>
            <Head>
                {fullHead}
            </Head>

            <main className={categoryStyles.main}>
                <div className={categoryStyles.background} />
                <h1 className={styles.title}>{title.charAt(0).toUpperCase()
                    + title.slice(1)}</h1>
                <div className={categoryStyles.container}>
                    <ul className={`${styles.grid} ${categoryStyles.grid}`}>
                        {posts &&
                            posts.length > 0 &&
                            posts.map((post) => {
                                return (
                                    <>
                                        <li key={post.uri} className={`${styles.card} `}>
                                            <Link href={post.uri}>
                                                <a>
                                                    <h3>{post.title}</h3>
                                                    <div
                                                        className={styles.excerpt}
                                                        dangerouslySetInnerHTML={{
                                                            __html: postExcerptShorten(post.excerpt),
                                                        }}
                                                    />
                                                </a>
                                            </Link>
                                        </li>
                                    </>
                                );
                            })}

                        {!posts ||
                            (posts.length === 0 && (
                                <li>
                                    <p>Oops, no posts found!</p>
                                </li>
                            ))}
                    </ul>
                </div>
            </main>
        </div>)

}


export async function getStaticProps({ params, locale, ...props }) {
    const { categorySlug, postSlug } = params;
    console.log("params", props, locale, params)
    const language = locale.toUpperCase();

    const apolloClient = getApolloClient();
    const databaseIdQuery = await apolloClient.query({
        query: gql`
        query getCatId($categorySlug: [String])
        {
            categories(where: {slug: $categorySlug}) {
                nodes {
                    databaseId
                }
            }
        }`
        ,
        variables: {
            categorySlug
        }
    })
    const databaseId = databaseIdQuery?.data.categories.nodes[0].databaseId;
    console.log("databaseIdQuery", databaseId)

    const categoryTranslationsData = await apolloClient.query({
        query: gql`
        query getTranslationsForCategory($id: ID!, $language: LanguageCodeEnum!) 
            {
            generalSettings {
            title
            }
            category(id: $id, idType: DATABASE_ID) {
                seo {
                    fullHead
                    metaDesc
                    metaKeywords
                }
                translation(language: $language) {
                    slug
                    posts {
                        nodes {
                            slug
                            uri
                            title
                            excerpt
                        }
                    }
                }
                language {
                    code
                }
            }
        }
      `,
        variables: {
            id: databaseId,
            language,
        },
    });
    const categoryTranslations = categoryTranslationsData?.data.category
    console.log("categoryTranslations", categoryTranslations)



    // let posts = data?.data.categories.edges[0].node.posts.nodes;
    let posts = categoryTranslations.translation.posts.nodes
    console.log("posts", posts)
    const site = {
        ...categoryTranslationsData?.data.generalSettings,
    };

    if (categoryTranslations?.language?.code && language !== categoryTranslations.language.code) {
        return {
            redirect: {
                destination: `/category/${categoryTranslations.translation.slug}`
            },
            props: {
                posts,
                language,
                path: `/${categoryTranslations.translation.slug}`,
                site,
                slug: categoryTranslations.translation.slug
            },
            revalidate: 10,
        };
    }

    return {
        props: {
            posts,
            language,
            path: `/${categoryTranslations.translation.slug}`,
            site,
            slug: categoryTranslations.translation.slug,
            categorySeo: categoryTranslations.seo
        },
        revalidate: 10,
    };
}

export async function getStaticPaths({ locales, defaultLocale, ...props }) {
    const apolloClient = getApolloClient();

    const data = await apolloClient.query({
        query: gql`
        {
        posts(first: 10000) {
          edges {
            node {
              id
              title
              slug
            }
          }
        }
      }
      `,
        // variables: {
        //     language: defaultLocale.toUpperCase(), //language
        // }
    });

    const posts = (data?.data?.posts?.edges || []).map(({ node }) => node);

    const paths = posts.map(({ slug }) => {
        return {
            params: {
                categorySlug: slug,
            },
        };
    });

    console.log("getStaticPaths props", props)
    return {
        paths: [
            ...paths,
        ],
        fallback: "blocking",
    };
}