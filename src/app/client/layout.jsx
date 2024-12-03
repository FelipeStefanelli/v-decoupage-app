import Header from "@/components/header";

export default function ClientLayout({children}) {
    return (
        <div>
            <Header />
            {children}
        </div>
    );
}