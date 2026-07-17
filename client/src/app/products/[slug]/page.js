import { fetchApi } from "@/lib/utils";
import ProductContent from "./ProductContent";

const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export async function generateMetadata({ params }) {
    const { slug } = params;
    let title = "Product Details | RHOSEATTE";
    let description =
        "Discover exquisite luxury fragrances crafted by master perfumers. Explore our curated collection of artisan scents.";
    let image = null;

    try {
        const response = await fetchApi(`/public/products/${slug}`);
        const product = response.data.product;

        if (product) {
            title = product.metaTitle || `${product.name} | RHOSEATTE`;
            description =
                product.metaDescription || product.description || description;

            if (product.images && product.images.length > 0) {
                image = getImageUrl(product.images[0].url);
            }
        }
    } catch (error) {
        console.error("Error fetching product metadata:", error);
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: image ? [image] : [],
            type: "website",
        },
    };
}

export default function ProductDetailPage({ params }) {
    return <ProductContent slug={params.slug} />;
}
