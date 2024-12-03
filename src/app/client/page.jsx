import VideoSection from '@/components/video-section';
import TimecodesSection from '@/components/timecodes-section';
import DragDropGrid from '@/components/newGrids/page';

export default function Client() {
    return (
        <div className="flex w-full">
            <VideoSection />
            {/* <TimecodesSection /> */}
            <DragDropGrid />
        </div>
    );
}
