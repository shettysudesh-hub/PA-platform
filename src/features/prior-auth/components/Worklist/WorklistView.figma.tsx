/**
 * Figma Code Connect — WorklistView
 *
 * This file links WorklistView to its Figma design node.
 * It will become active once the Figma frame is rebuilt using
 * published MDS Figma library components (Table, StatusHint, Badge, etc.)
 *
 * Figma file: https://www.figma.com/design/xKnOOj9jSLntK993kW522S/Pharmacy-Prior-Auth
 * Target frame: "1 · Worklist" (node 36:8)
 *
 * MDS components used in this view:
 *   <Table type="data" fetchData={...} withHeader withPagination />
 *   <StatusHint appearance="success|warning|alert|info" />
 *   <Badge appearance="accent2|primary|alert" subtle />
 *   <PageHeader title="Prior Authorization Worklist" />
 *   <Tabs tabs={config} activeIndex={0} onTabChange={...} />
 */

import WorklistView from './WorklistView';

// Code Connect registration — activate by replacing the node URL below
// with the published MDS component node IDs once the Figma file is updated.
//
// Example (once Table component instance is published in the Figma file):
//
// figma.connect(WorklistView, 'https://www.figma.com/design/xKnOOj9jSLntK993kW522S/...?node-id=36-8', {
//   render: () => (
//     <WorklistView />
//   ),
// });

export default WorklistView;
