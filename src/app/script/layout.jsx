import Header from "@/components/header";

export default function ScriptLayout({children}) {
    return (
        <div>
            <Header />
            {children}
        </div>
    );
}