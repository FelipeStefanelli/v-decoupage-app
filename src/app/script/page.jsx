import TimecodesSection from '@/components/timecodes-section';
import DragDropGrid from '@/components/newGrids/page';


export default function Script() {
    return (
        <div className="flex w-full">
            {/* <TimecodesSection script /> */}
            <DragDropGrid script />
        </div>
    );
}
