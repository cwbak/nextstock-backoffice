import { NetworkIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  CorporationIndustry,
  IndustryClass,
  IndustryDivision,
  IndustryGroup,
  IndustrySection,
  IndustrySubclass,
} from "@/data-access/schemas/corporation-industry";

interface CompactIndustryNode {
  children: ReadonlyArray<CompactIndustryNode>;
  details: ReadonlyArray<string>;
  id: string;
  name: string;
}

function compactIndustryNode(node: CompactIndustryNode): CompactIndustryNode {
  const children = node.children.map(compactIndustryNode);
  const [onlyChild] = children;

  if (
    node.details.length === 0 &&
    children.length === 1 &&
    onlyChild !== undefined &&
    onlyChild.name === node.name
  ) {
    return {
      children: onlyChild.children,
      details: onlyChild.details,
      id: `${node.id}/${onlyChild.id}`,
      name: node.name,
    };
  }

  return { ...node, children };
}

function buildSubclassNode(subclass: IndustrySubclass): CompactIndustryNode {
  return {
    children: [],
    details: subclass.details,
    id: `subclass-${subclass.code}`,
    name: subclass.name,
  };
}

function buildClassNode(industryClass: IndustryClass): CompactIndustryNode {
  return {
    children: industryClass.subclasses.map(buildSubclassNode),
    details: [],
    id: `class-${industryClass.code}`,
    name: industryClass.name,
  };
}

function buildGroupNode(group: IndustryGroup): CompactIndustryNode {
  return {
    children: group.classes.map(buildClassNode),
    details: [],
    id: `group-${group.code}`,
    name: group.name,
  };
}

function buildDivisionNode(division: IndustryDivision): CompactIndustryNode {
  return {
    children: division.groups.map(buildGroupNode),
    details: [],
    id: `division-${division.code}`,
    name: division.name,
  };
}

function buildSectionNode(section: IndustrySection): CompactIndustryNode {
  return {
    children: section.divisions.map(buildDivisionNode),
    details: [],
    id: `section-${section.code}`,
    name: section.name,
  };
}

function IndustryTreeItem({ node }: { node: CompactIndustryNode }) {
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div className="flex items-start gap-2 py-1.5">
        <span
          aria-hidden="true"
          className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/55"
        />
        <span
          className={
            hasChildren
              ? "text-sm leading-5 font-medium text-foreground"
              : "text-sm leading-5 text-foreground/90"
          }
        >
          {node.name}
        </span>
      </div>
      {node.details.length > 0 ? (
        <ul className="ml-4 pb-1 text-xs leading-relaxed text-muted-foreground">
          {node.details.map((detail, index) => (
            <li className="flex gap-2 py-0.5" key={`${detail}-${index}`}>
              <span aria-hidden="true">–</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {hasChildren ? (
        <ul className="ml-1 border-l border-border/70 pl-3">
          {node.children.map((child) => (
            <IndustryTreeItem key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CorporationIndustryTree({
  industry,
}: {
  industry: CorporationIndustry;
}) {
  if (industry.sections.length === 0) {
    return (
      <Empty className="min-h-40 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NetworkIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>업종 분류가 없습니다</EmptyTitle>
          <EmptyDescription>
            이 기업에 연결된 업종 분류 정보를 찾지 못했습니다.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const nodes = industry.sections
    .map(buildSectionNode)
    .map(compactIndustryNode);

  return (
    <ul
      aria-label="업종 분류 트리"
      className="rounded-lg bg-muted/35 px-3 py-2"
    >
      {nodes.map((node) => (
        <IndustryTreeItem key={node.id} node={node} />
      ))}
    </ul>
  );
}
