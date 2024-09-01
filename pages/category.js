import Head from "next/head";
import Link from "next/link";
import { gql } from "@apollo/client";

import { getApolloClient } from "../lib/apollo-client";

import styles from "../styles/Home.module.css";

export default function Category({ post, site }) {



}

const getCategories = gql`
${BlogInfoFragment}
${NavigationMenu.fragments.entry}
query GetPageData(
  $headerLocation: MenuLocationEnum
  $footerLocation: MenuLocationEnum
  $locale: LanguageCodeFilterEnum
) {
 
  categories(where: {language: $locale }) {
    nodes {
      slug
      name
    }
  }
}
`;